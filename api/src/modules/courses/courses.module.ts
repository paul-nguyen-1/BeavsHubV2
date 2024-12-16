import { Module } from '@nestjs/common';
import { CourseService } from './courses.service';
import { CourseController } from './courses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Courses, CoursesSchema } from './courses.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Courses.name,
        schema: CoursesSchema,
      },
    ]),
  ],
  providers: [CourseService],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
