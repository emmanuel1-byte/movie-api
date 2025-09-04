import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  imports: [],
  exports: [DatabaseService],
  controllers: [],
  providers: [DatabaseService],
})
export class DatabaseModule {}
