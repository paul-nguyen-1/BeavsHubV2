import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from '../../schemas/courses.schema';
import { CreateCourseDto } from '../../dto/create-course.dto'

@Controller('courses')
export class CoursesController {
  constructor(private courseService: CoursesService) {}

  @Get()
  async findAllCourses() {
    return await this.courseService.findAll();
  }

  @Get('/google-sheets')
  async readMasterCourseSheet() {
    return await this.courseService.readCourseReviews();
  }

  @Get('/google-sheets/update')
  async refreshMasterCourseSheet() {
    return await this.courseService.refreshCourseReviews();
  }

  @Post()
  async createCourse(
    @Body()
    course: CreateCourseDto,
  ): Promise<Course> {
    return await this.courseService.create(course);
  }
}
