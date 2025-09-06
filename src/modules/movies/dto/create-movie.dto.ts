/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString } from 'class-validator';

export class createMovieDto {
  @IsString()
  name: string;
}
