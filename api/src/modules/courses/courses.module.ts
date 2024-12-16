import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { DatabaseModule } from 'src/database/database.module';
import { coursesProviders } from './courses.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [CoursesController],
  providers: [CoursesService, ...coursesProviders],
})
export class CoursesModule {}
