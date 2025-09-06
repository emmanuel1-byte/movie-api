import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { DatabaseService } from './modules/database/database.service';
import Joi from 'joi';
import authConfig from './modules/config/auth.config';
import { AuthModule } from './modules/auth/auth.module';
import { MovieModule } from './modules/movies/movies.module';

@Module({
  imports: [
    AuthModule,
    MovieModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
      validationSchema: Joi.object({
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),

        REFRESH_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),

        OTP_SECRET: Joi.string().required(),
        OTP_EXPIRES_IN: Joi.string().required(),
      }),
    }),
    DatabaseModule,
  ],
  controllers: [],
  providers: [DatabaseService],
})
export class AppModule {}
