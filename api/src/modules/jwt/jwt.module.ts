import { Module } from '@nestjs/common';
import { JwtValidationService } from './jwt-validation.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtController } from './jwt.controller';

@Module({
  controllers: [JwtController],
  providers: [JwtValidationService, JwtAuthGuard],
  exports: [JwtValidationService, JwtAuthGuard],
})
export class JwtModule {}
