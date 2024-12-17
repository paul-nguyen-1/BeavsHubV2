import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from 'src/schemas/courses.schema';
import { CreateCourseDto } from 'src/dto/create-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private courseService: CoursesService) {}

  @Get()
  async findAllCourses() {
    return await this.courseService.findAll();
  }

  @Post()
  async createCourse(
    @Body()
    course: CreateCourseDto,
  ): Promise<Course> {
    return await this.courseService.create(course);
  }
}
