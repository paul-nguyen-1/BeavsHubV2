import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Course } from '../../schemas/courses.schema';
import { CreateCourseDto } from 'src/dto/create-course.dto';
import { HttpService } from '@nestjs/axios';

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

  async readCourseReviews() {
    const response = await this.httpService.axiosRef.get(
      process.env.MASTER_SHEET_URL,
    );
    const data = response.data;
    const [headerRow, ...dataRows] = data.values;

    const rowObjects = dataRows.map((row) => {
      const obj: Record<string, string> = {};
      headerRow.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });

    const cleanData = rowObjects.map((row) => ({
      timestamp: new Date(row['Timestamp'] || row['timestamp']),
      course1_name: row['What Course Did You Take?'],
      course1_difficulty: row['How hard was this class?'],
      course1_time_spent_per_week:
        row[
          'How much time did you spend on average (per week) for this class?'
        ],
      course1_tips:
        row['What tips would you give students taking this course?'],
      course1_taken_date: row['When did you take this course?'],
      second_course_taken: row['Did You Take a Second Course This Quarter?'],
      course2_name: row['What Course Did You Take?'],
      course2_difficulty: row['How hard was this class?'],
      course2_time_spent_per_week:
        row[
          'How much time did you spend on average (per week) for this class?'
        ],
      course2_tips:
        row['What tips would you give students taking this course?'],
      third_course_taken: row['Did You Take a Third Course This Quarter?'],
      course3_name: row['What Course Did You Take?'],
      course3_difficulty: row['How hard was this class?'],
      course3_time_spent_per_week:
        row[
          'How much time did you spend on average (per week) for this class?'
        ],
      course3_tips:
        row['What tips would you give students taking this course?'],
    }));
    return cleanData;
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const createdCat = new this.courseModel(createCourseDto);
    return createdCat.save();
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }
}
