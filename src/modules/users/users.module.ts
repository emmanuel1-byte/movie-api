import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  exports: [UserService],
  imports: [DatabaseModule],
  controllers: [],
  providers: [UserService],
})
export class UserModule {}
