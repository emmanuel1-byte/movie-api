import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MovieService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createMovie(userId: string, payload: createMovieDto) {
    await this.databaseService.movie.findUnique({
      where: {
        name: payload.name,
      },
    });
    const movie = await this.databaseService.movie.create({
      data: { userId, ...payload },
    });
    return movie;
  }

  async getMovie(movieId: string) {
    const movie = await this.databaseService.movie.findUnique({
      where: {
        id: movieId,
      },
    });
    return movie;
  }

  async listMovies(userId: string, query: string, page: number, limit: number) {
    const movie = await this.databaseService.movie.findMany({
      where: {
        userId,
        name: { contains: query, mode: 'insensitive' },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await this.databaseService.movie.count();
    const totalMovies = Math.ceil(total / limit);
    return {
      data: {
        movie,
        pagination: {
          total,
          page,
          limit,
          totalMovies,
        },
      },
    };
  }

  async updateMovie(movieId: string, payload: UpdateMovieDto) {
    const movie = await this.databaseService.movie.update({
      where: {
        id: movieId,
      },
      data: payload,
    });
    return movie;
  }

  async deleteMovie(movieId: string) {
    const movie = await this.databaseService.movie.delete({
      where: {
        id: movieId,
      },
    });
    return movie;
  }
}
