import { Controller, Get, Post, Put, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('course')
export class CoursesController {
  constructor(private readonly courseService: CoursesService) {}

  @Get('random')
  async getRandomPath() {
    return {
      message: 'This is a random path!',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('all-values')
  async getAllValues(
    @Query('spreadsheetId') spreadsheetId: string,
    @Query('sheetName') sheetName: string,
  ): Promise<any[][]> {
    return await this.courseService.getAllValues(spreadsheetId, sheetName);
  }
}
