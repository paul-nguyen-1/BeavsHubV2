import { Inject, Injectable } from '@nestjs/common';
import { Model, Query } from 'mongoose';
import { Course, ParentCourse } from '../../schemas/courses.schema';
import { HttpService } from '@nestjs/axios';
import { randomUUID, createHash } from 'crypto';
import { ParentCourseDto, CourseDto } from '../../dto/create-course.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { subMonths, subYears } from 'date-fns';

// Deterministic id derived from stable source content (rather than
// randomUUID()) so re-ingesting the same sheet row is a no-op instead of
// inserting a duplicate. Based on the sheet's own raw timestamp string,
// which is stable across syncs even when Date-parsing that string is not
// (e.g. timezone-dependent parsing of an unzoned timestamp string can drift
// between runs).
const stableId = (parts: string): string =>
  createHash('sha1').update(parts).digest('hex');

const CONTENT_FIELDS = {
  course_name: 1,
  course_difficulty: 1,
  course_time_spent_per_week: 1,
  course_tips: 1,
  course_enjoyability: 1,
  course_taken_date: 1,
  pairs: 1,
} as const;

// Content signature for a submission's set of course reviews, independent
// of _id/timestamp. Two rows in the source sheet can be distinct (different
// raw timestamps, e.g. an accidental double-submit of the same form a few
// seconds apart) yet describe the exact same reviews - this lets us catch
// that case too, on top of the id-based dedup above.
const contentKey = (
  docs: Pick<
    CourseDto,
    | 'course_name'
    | 'course_difficulty'
    | 'course_time_spent_per_week'
    | 'course_tips'
    | 'course_enjoyability'
    | 'course_taken_date'
    | 'pairs'
  >[],
): string =>
  docs
    .map((c) =>
      [
        (c.course_name || '').trim(),
        c.course_difficulty,
        (c.course_time_spent_per_week || '').trim(),
        (c.course_tips || '').trim(),
        (c.course_enjoyability || '').trim(),
        (c.course_taken_date || '').trim(),
        [...(c.pairs || [])].sort().join('|'),
      ].join('::'),
    )
    .sort()
    .join('~~~');

// The capstone course has been renumbered and renamed over time ("419 -
// Software Projects", "419/467 - Software Projects", "419 (Legacy)/467 -
// Capstone"), so reviews for the same class exist under different literal
// course_name values. 419 and 467 have only ever referred to this one course,
// so grouping by those course numbers (rather than a fixed list of past
// names) keeps any future variant merged in automatically.
const CAPSTONE_NUMBER_REGEX = '\\b(419|467)\\b';
const CAPSTONE_CANONICAL_NAME = 'CS 419 (Legacy)/467 - Capstone';

const isCapstoneCourseName = (name: string) =>
  new RegExp(CAPSTONE_NUMBER_REGEX, 'i').test(name);

@Injectable()
export class CoursesService {
  constructor(
    @Inject('PARENT_COURSE_MODEL')
    private parentCourseModel: Model<ParentCourse>,
    @Inject('COURSE_MODEL')
    private courseModel: Model<Course>,
    private readonly httpService: HttpService,
  ) {}

  private buildCourseNameFilter(id: string) {
    if (isCapstoneCourseName(id)) {
      return { $regex: CAPSTONE_NUMBER_REGEX, $options: 'i' };
    }
    return { $regex: id, $options: 'i' };
  }

  async cleanHeaders(headers: string[]): Promise<string[]> {
    const seenHeaders: Record<string, number> = {};
    return headers.map((header) => {
      if (seenHeaders[header]) {
        seenHeaders[header] += 1;
        return `${header} ${seenHeaders[header]}`;
      } else {
        seenHeaders[header] = 1;
        return `${header} 1`;
      }
    });
  }

  async readCourseReviews(): Promise<{
    parentRecords: ParentCourseDto[];
    courseRecords: CourseDto[];
  }> {
    const response = await this.httpService.axiosRef.get(
      process.env.MASTER_SHEET_URL,
    );
    const data = response.data;
    const [headerRow, ...dataRows] = data.values;

    const cleanedHeaderRow = await this.cleanHeaders(headerRow);

    const parentRecords: ParentCourseDto[] = [];
    const courseRecords: CourseDto[] = [];

    for (const row of dataRows) {
      const obj: Record<string, string> = {};
      cleanedHeaderRow.forEach((header, i) => {
        obj[header] = row[i];
      });

      const rawTimestamp = obj['Timestamp 1'] || obj['timestamp 1'] || '';
      const parentId = stableId(`parent:${rawTimestamp}`);
      const timestamp = new Date(rawTimestamp);

      parentRecords.push({
        _id: parentId,
        timestamp,
      });

      const courses = [1, 2, 3]
        .map((courseNumber) => {
          const courseName = obj[`What Course Did You Take? ${courseNumber}`];
          if (courseName) {
            return {
              parent_id: parentId,
              course_name: courseName,
              course_difficulty:
                parseInt(obj[`How hard was this class? ${courseNumber}`]) ||
                null,
              course_time_spent_per_week:
                obj[
                  `How much time did you spend on average (per week) for this class? ${courseNumber}`
                ],
              course_enjoyability: obj[`How much did you enjoy this class?`],
              course_tips:
                obj[
                  `What tips would you give students taking this course? ${courseNumber}`
                ],
              course_taken_date:
                obj[`When did you take this course? ${courseNumber}`],
            };
          }
          return null;
        })
        .filter(Boolean);

      courses.forEach((course, index) => {
        const pairs = courses
          .filter((_, pairIndex) => pairIndex !== index)
          .map((pairCourse) => pairCourse.course_name);

        courseRecords.push({
          _id: stableId(`course:${parentId}:${index}`),
          parent_id: parentId,
          timestamp,
          ...course,
          pairs,
        });
      });
    }
    return { parentRecords, courseRecords };
  }

  async refreshCourseReviews(): Promise<void> {
    const { parentRecords, courseRecords } = await this.readCourseReviews();

    const existingParents = await this.parentCourseModel
      .find(
        { _id: { $in: parentRecords.map((record) => record._id) } },
        { _id: 1 },
      )
      .lean()
      .exec();
    const existingParentIds = new Set(existingParents.map((p) => p._id));

    const newParentRecords = parentRecords.filter(
      (record) => !existingParentIds.has(record._id),
    );

    const newParentIds = new Set(
      newParentRecords.map((record) => record._id),
    );

    const courseRecordsByParent = new Map<string, CourseDto[]>();
    for (const record of courseRecords) {
      if (!newParentIds.has(record.parent_id)) continue;
      const bucket = courseRecordsByParent.get(record.parent_id) ?? [];
      bucket.push(record);
      courseRecordsByParent.set(record.parent_id, bucket);
    }

    // Second dedup pass, on content rather than id: catches the same
    // submission appearing as two distinct sheet rows (e.g. an accidental
    // double-submit of the form a few seconds apart), which the id-based
    // check above can't see since each row legitimately has its own raw
    // timestamp.
    const existingCourses = await this.courseModel
      .find({ internal: { $ne: true } }, { parent_id: 1, ...CONTENT_FIELDS })
      .lean()
      .exec();
    const existingCoursesByParent = new Map<string, CourseDto[]>();
    for (const doc of existingCourses) {
      const bucket = existingCoursesByParent.get(doc.parent_id) ?? [];
      bucket.push(doc as unknown as CourseDto);
      existingCoursesByParent.set(doc.parent_id, bucket);
    }
    const existingContentKeys = new Set(
      [...existingCoursesByParent.values()].map((docs) => contentKey(docs)),
    );

    const seenContentKeys = new Set<string>();
    const dedupedParentIds = new Set<string>();
    for (const record of newParentRecords) {
      const docs = courseRecordsByParent.get(record._id) ?? [];
      const key = contentKey(docs);
      if (existingContentKeys.has(key) || seenContentKeys.has(key)) continue;
      seenContentKeys.add(key);
      dedupedParentIds.add(record._id);
    }

    const dedupedParentRecords = newParentRecords.filter((record) =>
      dedupedParentIds.has(record._id),
    );
    const newCourseRecords = courseRecords.filter((record) =>
      dedupedParentIds.has(record.parent_id),
    );

    if (dedupedParentRecords.length > 0) {
      // ordered: false + deterministic ids: if a concurrent request already
      // inserted one of these (both passed the existence check above before
      // either committed), Mongo's unique _id index rejects just that one
      // duplicate instead of the whole batch failing.
      try {
        await this.parentCourseModel.insertMany(dedupedParentRecords, {
          ordered: false,
        });
      } catch (err: any) {
        if (err.code !== 11000) throw err;
      }
      try {
        await this.courseModel.insertMany(newCourseRecords, {
          ordered: false,
        });
      } catch (err: any) {
        if (err.code !== 11000) throw err;
      }
      console.log(
        `Inserted ${dedupedParentRecords.length} parent records and ${newCourseRecords.length} courses.`,
      );
    } else {
      console.log('No new course reviews to insert.');
    }
  }

  async createParentCourse(
    createParentCourseDto: ParentCourseDto,
  ): Promise<Course> {
    const createdParentCourse = new this.courseModel(createParentCourseDto);
    return createdParentCourse.save();
  }

  async createChildCourses(createCourseDtos: CourseDto[]): Promise<Course[]> {
    return this.courseModel.insertMany(createCourseDtos);
  }

  async findCourse(
    id: string,
    query: ExpressQuery,
    courseTips?: string,
    date?: string,
    difficulty?: string,
    time_spent?: string,
  ): Promise<Course[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    const filters: any = {
      course_name: this.buildCourseNameFilter(id),
    };

    if (courseTips) {
      filters.course_tips = { $regex: courseTips, $options: 'i' };
    }

    if (date) {
      const normalizedDate = decodeURIComponent(date).trim().toLowerCase();
      const currentDate = new Date();
      let dateFilter: Date | null = null;

      switch (normalizedDate) {
        case '1 month':
          dateFilter = subMonths(currentDate, 1);
          break;
        case '3 months':
          dateFilter = subMonths(currentDate, 3);
          break;
        case '6 months':
          dateFilter = subMonths(currentDate, 6);
          break;
        case '1 year':
          dateFilter = subYears(currentDate, 1);
          break;
        case '2 years':
          dateFilter = subYears(currentDate, 2);
          break;
      }

      if (dateFilter) {
        filters.timestamp = { $gte: dateFilter };
      }
    }
    if (difficulty) {
      filters.course_difficulty = Number(difficulty);
    }

    if (time_spent && time_spent.trim()) {
      filters.course_time_spent_per_week = {
        $regex: time_spent.trim(),
        $options: 'i',
      };
    }

    return await this.courseModel
      .find(filters)
      .sort({ timestamp: -1 })
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }

  async createCourse(body: CourseDto): Promise<CourseDto> {
    const newCourse = new this.courseModel({
      ...body,
      _id: randomUUID(),
      parent_id: randomUUID(),
      timestamp: new Date(),
      internal: true,
    });
    return newCourse.save();
  }

  async findAll(
    query: ExpressQuery,
    courseTips?: string,
    date?: string,
    difficulty?: string,
    time_spent?: string,
    requireText?: string,
  ): Promise<Course[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const filters: any = {};

    if (query.keyword) {
      filters.$or = [{ title: { $regex: query.keyword, $options: 'i' } }];
    }

    if (courseTips) {
      filters.course_tips = { $regex: courseTips, $options: 'i' };
    } else if (requireText === 'true') {
      // Non-whitespace text required, matching the placeholder behavior in
      // the reviews list where a blank course_tips renders as "No comments
      // were submitted" - feeds that shouldn't show that placeholder (e.g.
      // the homepage's latest-reviews section) opt into this instead.
      filters.course_tips = { $regex: '\\S' };
    }

    if (date) {
      const normalizedDate = decodeURIComponent(date).trim().toLowerCase();
      const currentDate = new Date();
      let dateFilter: Date | null = null;

      switch (normalizedDate) {
        case '1 month':
          dateFilter = subMonths(currentDate, 1);
          break;
        case '3 months':
          dateFilter = subMonths(currentDate, 3);
          break;
        case '6 months':
          dateFilter = subMonths(currentDate, 6);
          break;
        case '1 year':
          dateFilter = subYears(currentDate, 1);
          break;
        case '2 years':
          dateFilter = subYears(currentDate, 2);
          break;
      }

      if (dateFilter) {
        filters.timestamp = { $gte: dateFilter };
      }
    }
    if (difficulty) {
      filters.course_difficulty = Number(difficulty);
    }

    if (time_spent && time_spent.trim()) {
      filters.course_time_spent_per_week = {
        $regex: time_spent.trim(),
        $options: 'i',
      };
    }

    return await this.courseModel
      .find(filters)
      .sort({ timestamp: -1 })
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }

  // No Pagination -- Access Chart Data
  async findAllCourses(
    courseTips?: string,
    date?: string,
    difficulty?: string,
    time_spent?: string,
  ): Promise<Course[]> {
    const filters: any = {};
    if (courseTips) {
      filters.course_tips = { $regex: courseTips, $options: 'i' };
    }

    if (date) {
      const currentDate = new Date();
      let dateFilter: Date | null = null;

      switch (date) {
        case '1 Month':
          dateFilter = subMonths(currentDate, 1);
          break;
        case '3 Months':
          dateFilter = subMonths(currentDate, 3);
          break;
        case '6 Months':
          dateFilter = subMonths(currentDate, 6);
          break;
        case '1 Year':
          dateFilter = subYears(currentDate, 1);
          break;
        case '2 Years':
          dateFilter = subYears(currentDate, 2);
          break;
      }

      if (dateFilter) {
        filters.timestamp = { $gte: dateFilter };
      }
    }

    if (difficulty) {
      filters.course_difficulty = Number(difficulty);
    }

    if (time_spent && time_spent.trim()) {
      filters.course_time_spent_per_week = {
        $regex: time_spent.trim(),
        $options: 'i',
      };
    }

    return await this.courseModel.find(filters).lean().exec();
  }

  async findAllCourseReviews(
    id: string,
    query: ExpressQuery,
    courseTips?: string,
    date?: string,
    difficulty?: string,
    time_spent?: string,
  ): Promise<Course[]> {
    const filters: any = {
      course_name: this.buildCourseNameFilter(id),
    };

    if (courseTips) {
      filters.course_tips = { $regex: courseTips, $options: 'i' };
    }

    if (date) {
      const normalizedDate = decodeURIComponent(date).trim().toLowerCase();
      const currentDate = new Date();
      let dateFilter: Date | null = null;

      switch (normalizedDate) {
        case '1 month':
          dateFilter = subMonths(currentDate, 1);
          break;
        case '3 months':
          dateFilter = subMonths(currentDate, 3);
          break;
        case '6 months':
          dateFilter = subMonths(currentDate, 6);
          break;
        case '1 year':
          dateFilter = subYears(currentDate, 1);
          break;
        case '2 years':
          dateFilter = subYears(currentDate, 2);
          break;
      }

      if (dateFilter) {
        filters.timestamp = { $gte: dateFilter };
      }
    }
    if (difficulty) {
      filters.course_difficulty = Number(difficulty);
    }

    if (time_spent && time_spent.trim()) {
      filters.course_time_spent_per_week = {
        $regex: time_spent.trim(),
        $options: 'i',
      };
    }

    return await this.courseModel.find(filters).sort({ timestamp: -1 }).exec();
  }

  async mostFrequentCourses() {
    return this.courseModel
      .aggregate([
        { $sort: { createdAt: -1 } },
        {
          $addFields: {
            hours: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$course_time_spent_per_week', '0-5 hours'] },
                    then: 2.5,
                  },
                  {
                    case: {
                      $eq: ['$course_time_spent_per_week', '6-12 hours'],
                    },
                    then: 9,
                  },
                  {
                    case: {
                      $eq: ['$course_time_spent_per_week', '13-18 hours'],
                    },
                    then: 15.5,
                  },
                  {
                    case: { $eq: ['$course_time_spent_per_week', '18+ hours'] },
                    then: 20,
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            hasTips: {
              $cond: [{ $regexMatch: { input: { $ifNull: ['$course_tips', ''] }, regex: '\\S' } }, 1, 0],
            },
            rand: { $rand: {} },
          },
        },
        // Prefer a representative review with actual text over a blank one
        // (random among ties), so trending-course cards don't surface empty
        // tips when the course has other reviews that do have text.
        { $sort: { hasTips: -1, rand: 1 } },
        {
          $addFields: {
            groupName: {
              $cond: [
                {
                  $regexMatch: {
                    input: '$course_name',
                    regex: CAPSTONE_NUMBER_REGEX,
                    options: 'i',
                  },
                },
                CAPSTONE_CANONICAL_NAME,
                '$course_name',
              ],
            },
          },
        },
        {
          $group: {
            _id: '$groupName',
            count: { $sum: 1 },
            avg_difficulty: { $avg: '$course_difficulty' },
            avg_hours: { $avg: '$hours' },
            course: { $first: '$$ROOT' },
          },
        },
        { $sort: { count: -1 } },
      ])
      .exec();
  }
}
