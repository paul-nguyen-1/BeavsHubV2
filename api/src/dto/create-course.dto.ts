import { ObjectId } from 'mongoose';

export class CreateCourseDto {
  readonly _id: ObjectId;
  readonly name: string;
  readonly course?: string;
  readonly date?: Date;
  readonly classPairing?: string;
  readonly comment?: string;
  readonly timeSpent?: string;
  readonly difficulty?: number;
}
