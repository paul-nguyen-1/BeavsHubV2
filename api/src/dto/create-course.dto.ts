import { ObjectId } from 'mongoose';

export class CreateCourseDto {
  readonly _id: ObjectId;
  readonly timestamp: Date;
  readonly course1_name: string;
  readonly course1_difficulty: number;
  readonly course1_time_spent_per_week: string;
  readonly course1_tips: string;
  readonly course1_taken_date: Date;
  readonly second_course_taken: boolean;
  readonly course2_name: string;
  readonly course2_difficulty: number;
  readonly course2_time_spent_per_week: string;
  readonly course2_tips: string;
  readonly third_course_taken: boolean;
  readonly course3_name: string;
  readonly course3_difficulty: number;
  readonly course3_time_spent_per_week: string;
  readonly course3_tips: string;
}
