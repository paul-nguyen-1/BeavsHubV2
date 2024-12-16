import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CoursesDocument = HydratedDocument<Course>;

@Schema({ collection: process.env.ENV_COLLECTION })
export class Course {
  @Prop({ required: true })
  name: string;

  @Prop()
  course: string;

  @Prop()
  date: Date;

  @Prop()
  classPairing: string;

  @Prop()
  comment: string;

  @Prop()
  timeSpent: string;

  @Prop()
  difficulty: number;
}

export const CoursesSchema = SchemaFactory.createForClass(Course);
