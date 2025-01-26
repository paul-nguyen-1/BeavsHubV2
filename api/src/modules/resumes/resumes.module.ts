import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { DatabaseModule } from '../../database/database.module';
import { HttpModule } from '@nestjs/axios';
import { resumesProviders } from './resumes.provider';
import { ResumesController } from './resumes.controller';

@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [ResumesController],
  providers: [ResumesService, ...resumesProviders],
})
export class ResumesModule {}
