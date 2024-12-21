import { Connection } from 'mongoose';
import { ParentCourseSchema, CourseSchema } from '../../schemas/courses.schema';

export const coursesProviders = [
  {
    provide: 'PARENT_COURSE_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('ParentCourse', ParentCourseSchema),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'COURSE_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Course', CourseSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
