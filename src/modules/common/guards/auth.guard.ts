import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from './types/jwt-payload.type';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token)
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Access token is required chief',
      });

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('auth.ACCESS_TOKEN_SECRET'),
      });
      request.user = payload;
    } catch (err) {
      if (err instanceof TokenExpiredError)
        throw new UnauthorizedException({
          code: 'AUTH_REQUIRED',
          message: 'Access token has expired bro',
        });

      if (err instanceof JsonWebTokenError)
        throw new UnauthorizedException({
          code: 'AUTH_REQUIRED',
          message: 'Invalid Access token',
        });
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
