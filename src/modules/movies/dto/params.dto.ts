/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class MoviePathDto {
  @IsUUID()
  id: string;
}

export class MoviewQueryDto {
  @IsOptional()
  @IsString()
  query: string;

  @Min(1)
  @IsNumber()
  page: number = 1;

  @Min(1)
  @Max(100)
  @IsNumber()
  limit: number = 10;
}
