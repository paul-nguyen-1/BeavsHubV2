import { Inject, Injectable } from '@nestjs/common';
import { Model, Query } from 'mongoose';
import { Course, ParentCourse } from '../../schemas/courses.schema';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { ParentCourseDto, CourseDto } from 'src/dto/create-course.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';

@Injectable()
export class CoursesService {
  constructor(
    @Inject('PARENT_COURSE_MODEL')
    private parentCourseModel: Model<ParentCourse>,
    @Inject('COURSE_MODEL')
    private courseModel: Model<Course>,
    private readonly httpService: HttpService,
  ) {}

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

      const parentId = uuidv4();
      const timestamp = new Date(obj['Timestamp 1'] || obj['timestamp 1']);

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
          _id: uuidv4(),
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
    const latestParent = await this.parentCourseModel
      .findOne()
      .sort({ timestamp: -1 })
      .exec();
    const latestTimestamp = latestParent
      ? new Date(latestParent.timestamp)
      : new Date(0);

    const { parentRecords, courseRecords } = await this.readCourseReviews();

    const newParentRecords = parentRecords.filter(
      (record) => new Date(record.timestamp) > latestTimestamp,
    );

    const newParentIds = newParentRecords.map((record) => record._id);

    const newCourseRecords = courseRecords.filter((record) =>
      newParentIds.includes(record.parent_id),
    );

    if (newParentRecords.length > 0) {
      await this.parentCourseModel.insertMany(newParentRecords, {
        ordered: true,
      });
      await this.courseModel.insertMany(newCourseRecords, { ordered: true });
      console.log(
        `Inserted ${newParentRecords.length} parent records and ${newCourseRecords.length} courses.`,
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
  ): Promise<Course[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    const filters: any = {
      course_name: { $regex: id, $options: 'i' },
    };

    if (courseTips) {
      filters.course_tips = { $regex: courseTips, $options: 'i' };
    }

    return await this.courseModel
      .find(filters)
      .sort({ timestamp: -1 })
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }

  async createCourse(body: CourseDto): Promise<CourseDto> {
    console.log('Incoming body:', body);

    const newCourse = new this.courseModel({
      ...body,
      _id: uuidv4(),
      parent_id: uuidv4(),
      timestamp: new Date(),
      internal: true,
    });

    console.log('New course before saving:', newCourse);
    return newCourse.save();
  }

  async findAll(query: ExpressQuery, courseTips?: string): Promise<Course[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const filters: any = {};

    if (query.keyword) {
      filters.$or = [{ title: { $regex: query.keyword, $options: 'i' } }];
    }

    if (courseTips) {
      filters.course_tips = { $regex: courseTips, $options: 'i' };
    }

    return await this.courseModel
      .find(filters)
      .sort({ timestamp: -1 })
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }

  // No Pagination -- Access Chart Data
  async findAllCourses(courseTips?: string): Promise<Course[]> {
    const filters: any = {};
    if (courseTips) {
      filters.course_tips = { $regex: courseTips, $options: 'i' };
    }
    return await this.courseModel.find(filters).lean().exec();
  }

  async findAllCourseReviews(
    id: string,
    query: ExpressQuery,
    courseTips?: string,
  ): Promise<Course[]> {
    const filters: any = {
      course_name: { $regex: id, $options: 'i' },
    };

    if (courseTips) {
      filters.course_tips = { $regex: courseTips, $options: 'i' };
    }

    return await this.courseModel.find(filters).sort({ timestamp: -1 }).exec();
  }
}
