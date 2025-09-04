import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,

  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,

  OTP_SECRET: process.env.OTP_SECRET,
  OTP_EXPIRES_IN: process.env.OTP_EXPIRES_IN,
}));
