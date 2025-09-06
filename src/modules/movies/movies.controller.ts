import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MovieService } from './movies.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { createMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MoviePathDto, MoviewQueryDto } from './dto/params.dto';
import { User } from '../common/decorators/user.decorator';

@UseInterceptors(ResponseInterceptor)
@UseGuards(AuthGuard)
@Controller('/api/v1/movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  async createMovie(@Body() movieDto: createMovieDto, @User() userId: string) {
    return await this.movieService.createMovie(userId, movieDto);
  }

  @Get('/:id')
  async getMovie(@Param() params: MoviePathDto) {
    return await this.movieService.getMovie(params.id);
  }

  @Get()
  async listMovies(@Query() params: MoviewQueryDto, @User() userId: string) {
    return await this.movieService.listMovies(
      userId,
      params.query,
      params.page,
      params.limit,
    );
  }

  @Put('/:id')
  async updateMovie(
    @Param() params: MoviePathDto,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return await this.movieService.updateMovie(params.id, updateMovieDto);
  }

  @Delete('/:id')
  async deleteMovie(@Param() params: MoviePathDto) {
    return await this.movieService.deleteMovie(params.id);
  }
}
