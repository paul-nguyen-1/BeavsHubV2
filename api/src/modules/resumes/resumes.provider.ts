import { Connection } from 'mongoose';
import { FileSchema } from '../../schemas/resumes.schema';

export const resumesProviders = [
  {
    provide: 'RESUMES_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Resumes', FileSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
