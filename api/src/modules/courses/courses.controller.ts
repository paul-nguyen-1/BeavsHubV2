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
    @Query('date') date?: string,
    @Query('difficulty') difficulty?: string,
    @Query('time_spent') time_spent?: string,
  ): Promise<CourseDto[]> {
    await this.courseService.refreshCourseReviews();
    return await this.courseService.findAll(
      query,
      courseTips,
      date,
      difficulty,
      time_spent,
    );
  }

  @Get('all')
  async getAllCourses(
    @Query('course_tips') courseTips?: string,
    @Query('date') date?: string,
    @Query('difficulty') difficulty?: string,
    @Query('time_spent') time_spent?: string,
  ): Promise<CourseDto[]> {
    console.log('Getting all courses');
    return await this.courseService.findAllCourses(
      courseTips,
      date,
      difficulty,
      time_spent,
    );
  }

  @Post('post')
  async postCourse(@Body() body: CourseDto): Promise<CourseDto> {
    console.log('Received body:', body);
    return await this.courseService.createCourse(body);
  }

  @Get('frequency')
  async getMostFrequentCourses(): Promise<CourseDto[]> {
    return this.courseService.mostFrequentCourses();
  }

  @Get(':id')
  async getCourseById(
    @Param('id') id: string,
    @Query() query: ExpressQuery,
    @Query('course_tips') courseTips?: string,
    @Query('date') date?: string,
    @Query('difficulty') difficulty?: string,
    @Query('time_spent') time_spent?: string,
  ): Promise<CourseDto[]> {
    return await this.courseService.findCourse(
      id,
      query,
      courseTips,
      date,
      difficulty,
      time_spent,
    );
  }

  @Get(':id/all_reviews')
  async getAllCourseById(
    @Param('id') id: string,
    @Query() query: ExpressQuery,
    @Query('course_tips') courseTips?: string,
    @Query('date') date?: string,
    @Query('difficulty') difficulty?: string,
    @Query('time_spent') time_spent?: string,
  ): Promise<CourseDto[]> {
    return await this.courseService.findAllCourseReviews(
      id,
      query,
      courseTips,
      date,
      difficulty,
      time_spent,
    );
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
