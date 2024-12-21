import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ParentCourseDocument = HydratedDocument<ParentCourse>;
export type CourseDocument = HydratedDocument<Course>;

@Schema({ collection: 'parent_courses' })
export class ParentCourse {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: Date, required: true })
  timestamp: Date;
}

export const ParentCourseSchema = SchemaFactory.createForClass(ParentCourse);

@Schema({ collection: 'courses' })
export class Course {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  parent_id: string;

  @Prop({ type: String, required: true })
  course_name: string;

  @Prop({ type: Number })
  course_difficulty: number;

  @Prop({ type: String })
  course_time_spent_per_week: string;

  @Prop({ type: String })
  course_tips: string;

  @Prop({ type: String })
  course_taken_date: string;

  @Prop({ type: [String] })
  pairs: string[];

  @Prop({ type: Date, required: true })
  timestamp: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
