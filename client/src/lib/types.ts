export interface CourseInfo {
  _id: string;
  course_difficulty: number;
  course_name: string;
  course_taken_date: string;
  course_time_spent_per_week: string;
  course_tips: string;
  course_enjoyability: string;
  timestamp: string;
  pairs: string[];
}

export interface CourseCard {
  key: string;
  course: string;
  difficulty: number;
  taken_date: string;
  enjoyability: string;
  time_spent_per_week: string;
  tips: string;
  timestamp: string;
  pairs: string[];
}

export interface ChartData {
  data: object[];
}

export interface BarChartDataItem {
  pairs: string[];
}

export interface PieChartDataItem {
  course_difficulty: number;
}

export interface DonutChartDataItem {
  course_time_spent_per_week: string;
}
