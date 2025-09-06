import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class MovieService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createMovie(userId: string, payload: createMovieDto) {
    const user = await this.databaseService.movie.findUnique({
      where: {
        name: payload.name,
      },
    });
    if (user) {
      throw new ConflictException({
        code: 'DUPLICATE_ENTRY',
        message: 'Movie already exist',
      });
    }

    const createdMovie = await this.databaseService.movie.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: { userId, ...payload },
    });

    return { message: 'Movie created succesfully', data: createdMovie };
  }

  async getMovie(movieId: string) {
    const movie = await this.databaseService.movie.findUnique({
      where: {
        id: movieId,
      },
    });
    if (!movie) {
      throw new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: 'Movie not found',
      });
    }
    return { message: 'Movie found', data: movie };
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
      message: 'Movies retrived',
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
    try {
      const movie = await this.databaseService.movie.update({
        where: {
          id: movieId,
        },
        data: payload,
      });
      return { message: 'Movie updated', data: movie };
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException({
          code: 'RESOURCE_NOT_FOUND',
          message: 'Movie not found',
        });
      }
      throw err;
    }
  }

  async deleteMovie(movieId: string) {
    try {
      const movie = await this.databaseService.movie.delete({
        where: {
          id: movieId,
        },
      });
      return { message: 'Movie deleted', data: movie };
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException({
          code: 'RESOURCE_NOT_FOUND',
          message: 'Movie not found',
        });
      }
      throw err;
    }
  }
}
