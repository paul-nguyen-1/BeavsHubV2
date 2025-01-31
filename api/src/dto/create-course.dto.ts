export class ParentCourseDto {
  _id: string;
  timestamp: Date;
}

export class CourseDto {
  _id: string;
  parent_id: string;
  course_name: string;
  course_difficulty: number;
  course_time_spent_per_week: string;
  course_tips: string;
  course_enjoyability: string;
  course_taken_date: string;
  pairs: string[];
  timestamp: Date;
}
