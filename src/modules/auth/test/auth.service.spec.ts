/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserService } from '../../users/user.service';

jest.mock('bcrypt');
describe('AuthService (Unit)', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findUser: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const mockValues = {
                'auth.ACCESS_TOKEN_SECRET': 'access-secret',
                'auth.ACCESS_TOKEN_EXPIRES_IN': '15m',
                'auth.REFRESH_TOKEN_SECRET': 'refresh-secret',
                'auth.REFRESH_TOKEN_EXPIRES_IN': '7d',
              };
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return mockValues[key];
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  describe('signup', () => {
    it('should throw ConflictException if user already exists', async () => {
      userService.findUser.mockResolvedValueOnce({
        id: '123',
        email: 'test@mail.com',
      } as any);

      await expect(
        authService.signup({ email: 'test@mail.com', password: 'pass' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new user if not found', async () => {
      userService.findUser.mockResolvedValueOnce(null);
      userService.createUser.mockResolvedValueOnce({
        id: '1',
        email: 'new@mail.com',
      } as any);

      const result = await authService.signup({
        email: 'new@mail.com',
        password: 'pass',
      } as any);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userService.createUser).toHaveBeenCalled();
      expect(result).toEqual({ id: '1', email: 'new@mail.com' });
    });
  });

  describe('login', () => {
    it('should throw NotFoundException if user not found', async () => {
      userService.findUser.mockResolvedValueOnce(null);

      await expect(
        authService.login({ email: 'none@mail.com', password: '1234' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      userService.findUser.mockResolvedValueOnce({
        id: '1',
        email: 'a@mail.com',
        password: 'hashed',
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        authService.login({ email: 'a@mail.com', password: 'wrong' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens and sanitized user on success', async () => {
      userService.findUser.mockResolvedValueOnce({
        id: '1',
        email: 'a@mail.com',
        password: 'hashed',
        role: 'user',
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await authService.login({
        email: 'a@mail.com',
        password: 'pass',
      } as any);

      expect(result).toEqual({
        message: 'Login successful',
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: { id: '1', email: 'a@mail.com', role: 'user' },
        },
      });
    });
  });
});
