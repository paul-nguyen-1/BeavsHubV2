import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CoursesDocument = HydratedDocument<Courses>;

@Schema()
export class Courses {
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

export const CoursesSchema = SchemaFactory.createForClass(Courses);
