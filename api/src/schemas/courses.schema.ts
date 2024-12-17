import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';

export type CoursesDocument = HydratedDocument<Course>;

@Schema({ collection: 'courses' })
export class Course {
  @Prop({ type: Types.ObjectId, required: true })
  _id: Types.ObjectId;

  @Prop()
  timestamp: Date;

  @Prop()
  course1_name: string;

  @Prop()
  course1_difficulty: number;

  @Prop()
  course1_time_spent_per_week: string;

  @Prop()
  course1_tips: string;

  @Prop()
  course1_taken_date: Date;

  @Prop()
  second_course_taken: boolean;

  @Prop()
  course2_name: string;

  @Prop()
  course2_difficulty: number;

  @Prop()
  course2_time_spent_per_week: string;

  @Prop()
  course2_tips: string;

  @Prop()
  third_course_taken: boolean;

  @Prop()
  course3_name: string;

  @Prop()
  course3_difficulty: number;

  @Prop()
  course3_time_spent_per_week: string;

  @Prop()
  course3_tips: string;
}

export const CoursesSchema = SchemaFactory.createForClass(Course);
