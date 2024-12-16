import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';

export type CoursesDocument = HydratedDocument<Course>;

@Schema({ collection: 'courses' })
export class Course {
  @Prop({ type: Types.ObjectId, required: true })
  _id: Types.ObjectId;

  @Prop()
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
