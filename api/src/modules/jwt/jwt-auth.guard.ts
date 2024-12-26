import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtValidationService } from './jwt-validation.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtValidationService: JwtValidationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract the Bearer token from the Authorization header
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    // Validate the token
    try {
      await this.jwtValidationService.validateToken(token);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }

    return true;
  }
}
