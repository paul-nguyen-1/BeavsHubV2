import { Connection } from 'mongoose';
import { CoursesSchema } from 'src/schemas/courses.schema';

export const coursesProviders = [
  {
    provide: 'COURSE_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Course', CoursesSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
