import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CourseDto, ParentCourseDto } from '../../dto/create-course.dto';

@Controller('masterCourses')
export class masterCoursesController {}

@Controller('courses')
export class CoursesController {
  constructor(private courseService: CoursesService) {}

  @Get()
  async getAllRecords() {
    return await this.courseService.readCourseReviews();
  }

  @Get('/refresh')
  async refreshRecords() {
    return await this.courseService.refreshCourseReviews();
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
