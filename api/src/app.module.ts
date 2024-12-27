import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CoursesModule } from './modules/courses/courses.module';
import { JwtModule } from './modules/jwt/jwt.module';

@Module({
  imports: [JwtModule, CoursesModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
