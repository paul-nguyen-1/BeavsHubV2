export interface CourseInfo {
  _id: string;
  course1_difficulty: number;
  course1_name: string;
  course1_taken_date: string;
  course1_time_spent_per_week: string;
  course1_tips: string;
  course2_difficulty: number;
  course2_name: string;
  course2_time_spent_per_week: string;
  course2_tips: string;
  second_course_taken: string;
  third_course_taken: string;
  timestamp: string;
  __v: number;
}

export interface CourseCard {
  key: string;
  course: string;
  difficulty: number;
  taken_date: string;
  time_spent_per_week: string;
  tips: string;
  timestamp: string;
}
