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
import { MoviePathDto, MovieQueryDto } from './dto/params.dto';
import { User } from '../common/decorators/user.decorator';
import { RolesGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { Role } from 'generated/prisma';

@UseInterceptors(ResponseInterceptor)
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.USER)
@Controller('/api/v1/movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  async createMovie(@Body() movieDto: createMovieDto, @User() userId: string) {
    const movie = await this.movieService.createMovie(userId, movieDto);
    return { message: 'Movie created succesfully', data: movie };
  }

  @Get('/:id')
  async getMovie(@Param() params: MoviePathDto) {
    const movie = await this.movieService.getMovie(params.id);
    return { message: 'Movie found', data: movie };
  }

  @Get()
  async listMovies(@Query() params: MovieQueryDto, @User() userId: string) {
    const { data } = await this.movieService.listMovies(
      userId,
      params.query,
      params.page,
      params.limit,
    );
    return { message: 'Movies retrived', data };
  }

  @Put('/:id')
  async updateMovie(
    @Param() params: MoviePathDto,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    const movie = await this.movieService.updateMovie(
      params.id,
      updateMovieDto,
    );
    return { message: 'Movie updated', data: movie };
  }

  @Delete('/:id')
  async deleteMovie(@Param() params: MoviePathDto) {
    const movie = await this.movieService.deleteMovie(params.id);
    return { message: 'Movie deleyed', data: movie };
  }
}
