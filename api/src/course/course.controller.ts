import { Controller, Get, Query } from '@nestjs/common';
import { CourseService } from './course.service';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('all-values')
  async getAllValues(
    @Query('spreadsheetId') spreadsheetId: string,
    @Query('sheetName') sheetName: string,
  ): Promise<any[][]> {
    return await this.courseService.getAllValues(spreadsheetId, sheetName);
  }
}
