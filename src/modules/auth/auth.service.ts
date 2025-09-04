import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/user.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(payload: SignupDto) {
    const user = await this.userService.findUser({ email: payload.email });
    if (user) {
      throw new ConflictException({
        code: 'DUPLICATE_ENTRY',
        message: 'You have an account with us',
      });
    }
    const createdUser = await this.userService.createUser(payload);
    return createdUser;
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userService.findUser({ email });
    if (!user) {
      throw new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: 'User not found',
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      });
    }

    // Sign access and refresh tokens in parallel
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.configService.get<string>('auth.ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>(
            'auth.ACCESS_TOKEN_EXPIRES_IN',
          ),
        },
      ),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.configService.get<string>('auth.REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>(
            'auth.REFRESH_TOKEN_EXPIRES_IN',
          ),
        },
      ),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...sanitizedUser } = user;

    return {
      message: 'Login successful',
      data: { accessToken, refreshToken, user: sanitizedUser },
    };
  }
}
