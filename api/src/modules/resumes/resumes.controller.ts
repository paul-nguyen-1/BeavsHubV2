import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Body('username') username: string,
    @Body('companies') companies: string[],
    @Body('positions') positions: string[],
  ) {
    const savedFile = await this.resumesService.uploadFile(
      file,
      username,
      companies,
      positions,
    );
    return { message: 'File uploaded successfully', file: savedFile };
  }

  @Get(':filename')
  async getFile(@Res() res, @Param('filename') filename: string) {
    try {
      const fileData = await this.resumesService.getFile(filename, res);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      });
      res.send(fileData);
    } catch (error) {
      console.error('Error retrieving file:', error.message);
      res.status(404).send({ message: 'File not found' });
    }
  }

  @Post('all')
  async getAllFiles() {
    const files = await this.resumesService.getFiles([]);
    return files.map((file) => ({
      filename: file.filename,
      url: file.url,
      companies: file.companies,
      positions: file.positions,
      username: file.username,
    }));
  }
}
