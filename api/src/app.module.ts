import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CourseModule } from './course/course.module';
import { CourseService } from './course/course.service';

@Module({
  imports: [CourseModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, CourseService],
})
export class AppModule {}
