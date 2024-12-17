import { Inject, Injectable } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { Model } from 'mongoose';
import { Course, CoursesDocument } from '../../schemas/courses.schema';
import { CreateCourseDto } from 'src/dto/create-course.dto';

/*
Refer to this doc 
https://developers.google.com/sheets/api/reference/rest
*/

@Injectable()
export class CoursesService {
  private sheets: sheets_v4.Sheets;

  constructor(
    @Inject('COURSE_MODEL')
    private courseModel: Model<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const createdCat = new this.courseModel(createCourseDto);
    return createdCat.save();
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }
}
