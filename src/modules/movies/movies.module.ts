import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MovieService } from './movies.service';
import { MovieController } from './movies.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule, JwtModule],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
