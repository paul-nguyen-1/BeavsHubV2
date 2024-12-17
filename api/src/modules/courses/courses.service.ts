import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Course } from '../../schemas/courses.schema';

import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { CreateCourseDto } from '../../dto/create-course.dto'

/*
Refer to this doc 
https://developers.google.com/sheets/api/reference/rest
*/

@Injectable()
export class CoursesService {
  constructor(
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

  async readCourseReviews() {
    const response = await this.httpService.axiosRef.get(
      process.env.MASTER_SHEET_URL,
    );
    const data = response.data;
    const [headerRow, ...dataRows] = data.values;

    const cleanedHeaderRow = await this.cleanHeaders(headerRow);

    const rowObjects = await Promise.all(
      dataRows.map(async (row) => {
        const obj: Record<string, string> = {};
        cleanedHeaderRow.forEach((header, i) => {
          obj[header] = row[i];
        });
        return obj;
      }),
    );

    const cleanData = rowObjects.map((row) => ({
      _id: uuidv4(),
      timestamp: new Date(row['Timestamp 1'] || row['timestamp 1']),
      course1_name: row['What Course Did You Take? 1'],
      course1_difficulty: row['How hard was this class? 1'],
      course1_time_spent_per_week:
        row[
          'How much time did you spend on average (per week) for this class? 1'
        ],
      course1_tips:
        row['What tips would you give students taking this course? 1'],
      course1_taken_date: row['When did you take this course? 1'],
      second_course_taken: row['Did You Take a Second Course This Quarter? 1'],
      course2_name: row['What Course Did You Take? 2'],
      course2_difficulty: row['How hard was this class? 2'],
      course2_time_spent_per_week:
        row[
          'How much time did you spend on average (per week) for this class? 2'
        ],
      course2_tips:
        row['What tips would you give students taking this course? 2'],
      third_course_taken: row['Did You Take a Third Course This Quarter? 1'],
      course3_name: row['What Course Did You Take? 3'],
      course3_difficulty: row['How hard was this class? 3'],
      course3_time_spent_per_week:
        row[
          'How much time did you spend on average (per week) for this class? 3'
        ],
      course3_tips:
        row['What tips would you give students taking this course? 3'],
    }));

    return cleanData;
  }

  async refreshCourseReviews(): Promise<void> {
    try {
      const latestRecord = await this.courseModel
        .findOne()
        .sort({ timestamp: -1 })
        .exec();

      const latestTimestamp = latestRecord
        ? new Date(latestRecord.timestamp)
        : new Date(0);

      const cleanData = await this.readCourseReviews();

      const newValues = cleanData.filter(
        (record) => new Date(record.timestamp) > latestTimestamp,
      );

      if (newValues.length > 0) {
        await this.courseModel.insertMany(newValues);
        console.log(`Inserted ${newValues.length} new course reviews.`);
      } else {
        console.log('No new course reviews to insert.');
      }
    } catch (error) {
      console.error('Error updating course reviews:', error.message);
      throw error;
    }
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const createdCat = new this.courseModel(createCourseDto);
    return createdCat.save();
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }
}
