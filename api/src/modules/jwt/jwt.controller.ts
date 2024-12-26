import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('jwt')
export class JwtController {
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtectedData(@Req() req) {
    const user = req.user;
    return {
      message: 'You have access to protected data',
      user,
    };
  }
}
