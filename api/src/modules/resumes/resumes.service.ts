import { Inject, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from '../../schemas/resumes.schema';

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
    positions: string[],
  ): Promise<File> {
    const timestamp = new Date();

    const companiesArray = Array.isArray(companies)
      ? companies
      : JSON.parse(companies);

    const resumesArray = Array.isArray(positions)
      ? positions
      : JSON.parse(positions);

    const newFile = new this.fileModel({
      filename: file.originalname,
      fileData: file.buffer,
      timestamp,
      username: username,
      companies: companiesArray,
      positions: resumesArray,
    });

    return await newFile.save();
  }

  async getFile(filename: string, res: Response): Promise<void> {
    const file = await this.fileModel.findOne({ filename });
    if (!file) {
      throw new Error('File not found');
    }
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
    });
    res.send(file.fileData);
  }

  async getFiles(filenames: string[]): Promise<
    {
      username: string;
      positions: string[];
      filename: string;
      url: string;
      companies: string[];
    }[]
  > {
    const query = filenames.length ? { filename: { $in: filenames } } : {};
    const files = await this.fileModel.find(query);
    return files.map((file) => ({
      username: file.username,
      filename: file.filename,
      url: `/resumes/${file.filename}`,
      companies: file.companies,
      positions: file.positions,
    }));
  }
}
