import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DatabaseModule } from '../database/database.module';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  exports: [UserService],
  imports: [DatabaseModule, JwtModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
