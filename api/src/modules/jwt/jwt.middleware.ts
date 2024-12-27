import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtValidationService } from './jwt-validation.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtValidationService: JwtValidationService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    this.jwtValidationService.validateToken(token);
    next();
  }
}
