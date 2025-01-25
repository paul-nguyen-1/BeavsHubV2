import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from 'src/schemas/resumes.schema';

@Injectable()
export class ResumesService {
  constructor(
    @Inject('RESUMES_MODEL')
    @InjectModel(File.name)
    private fileModel: Model<File>,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    username: string,
    companies: string[],
  ): Promise<File> {
    const timestamp = new Date();

    const companiesArray = Array.isArray(companies)
    ? companies
    : JSON.parse(companies);

  const newFile = new this.fileModel({
    filename: file.originalname,
    fileData: file.buffer,
    timestamp,
    user: username,
    companies: companiesArray,
  });

    return await newFile.save();
  }

  async getFile(filename: string): Promise<Buffer> {
    const file = await this.fileModel.findOne({ filename });
    if (!file) {
      throw new Error('File not found');
    }
    return file.fileData;
  }

  async getFiles(
    filenames: string[],
  ): Promise<{ filename: string; data: Buffer, companies: string[] }[]> {
    const query = filenames.length ? { filename: { $in: filenames } } : {};
    const files = await this.fileModel.find(query);
    return files.map((file) => ({
      filename: file.filename,
      data: file.fileData,
      companies: file.companies,
    }));
  }
}
