import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CourseDto, ParentCourseDto } from '../../dto/create-course.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';

@Controller('masterCourses')
export class masterCoursesController {}

@Controller('courses')
export class CoursesController {
  constructor(private courseService: CoursesService) {}

  @Get()
  async getAllRecords(
    @Query() query: ExpressQuery,
    @Query('course_tips') courseTips?: string,
  ): Promise<CourseDto[]> {
    await this.courseService.refreshCourseReviews();
    return await this.courseService.findAll(query, courseTips);
  }

  @Get('all')
  async getAllCourses(): Promise<CourseDto[]> {
    console.log('Getting all courses');
    return await this.courseService.findAllCourses();
  }

  @Get(':id')
  async getCourseById(
    @Param('id') id: string,
    @Query() query: ExpressQuery,
    @Query('course_tips') courseTips?: string,
  ): Promise<CourseDto[]> {
    return await this.courseService.findCourse(id, query, courseTips);
  }

  @Get(':id/all_reviews')
  async getAllCourseById(
    @Param('id') id: string,
    @Query() query: ExpressQuery,
    @Query('course_tips') courseTips?: string,
  ): Promise<CourseDto[]> {
    return await this.courseService.findAllCourseReviews(id, query, courseTips);
  }
}

@Controller('internalCourses')
export class ExternalCoursesController {
  // @Post()
  // async createCourse(
  //   @Body()
  //   course: CreateCourseDto,
  // ): Promise<Course> {
  //   return await this.courseService.create(course);
  // }
}
