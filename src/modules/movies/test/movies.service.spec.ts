/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { MovieService } from '../movies.service';
import { DatabaseService } from '../../database/database.service';

describe('MovieService (Unit)', () => {
  let movieService: MovieService;
  let databaseService: DeepMockProxy<DatabaseService>;

  beforeEach(async () => {
    databaseService = mockDeep<DatabaseService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        { provide: DatabaseService, useValue: databaseService },
      ],
    }).compile();

    movieService = module.get<MovieService>(MovieService);
  });

  describe('createMovie', () => {
    it('should throw ConflictException if movie already exists', async () => {
      databaseService.movie.findUnique.mockResolvedValueOnce({
        id: '1',
        name: 'Avatar',
      } as any);

      await expect(
        movieService.createMovie('user1', { name: 'Avatar' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new movie if not found', async () => {
      databaseService.movie.findUnique.mockResolvedValueOnce(null);
      databaseService.movie.create.mockResolvedValueOnce({
        id: '1',
        name: 'New Movie',
      } as any);

      const result = await movieService.createMovie('user1', {
        name: 'New Movie',
      } as any);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(databaseService.movie.create).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Movie created succesfully',
        data: { id: '1', name: 'New Movie' },
      });
    });
  });

  describe('getMovie', () => {
    it('should return movie if found', async () => {
      databaseService.movie.findUnique.mockResolvedValueOnce({
        id: '1',
        name: 'Inception',
      } as any);

      const result = await movieService.getMovie('1');
      expect(result).toEqual({
        message: 'Movie found',
        data: { id: '1', name: 'Inception' },
      });
    });

    it('should throw NotFoundException if movie not found', async () => {
      databaseService.movie.findUnique.mockResolvedValueOnce(null);

      await expect(movieService.getMovie('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listMovies', () => {
    it('should return paginated movies with query filter', async () => {
      databaseService.movie.findMany.mockResolvedValueOnce([
        { id: '1', name: 'Matrix' },
      ] as any);
      databaseService.movie.count.mockResolvedValueOnce(10);

      const result = await movieService.listMovies('user1', 'Mat', 1, 5);

      expect(result).toEqual({
        message: 'Movies retrived',
        data: {
          movie: [{ id: '1', name: 'Matrix' }],
          pagination: {
            total: 10,
            page: 1,
            limit: 5,
            totalMovies: 2,
          },
        },
      });
    });

    it('should return all movies if query is empty', async () => {
      databaseService.movie.findMany.mockResolvedValueOnce([
        { id: '1', name: 'Avatar' },
        { id: '2', name: 'Titanic' },
      ] as any);
      databaseService.movie.count.mockResolvedValueOnce(2);

      const result = await movieService.listMovies('user1', '', 1, 10);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(databaseService.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'user1',
            name: { contains: '', mode: 'insensitive' },
          },
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      );

      expect(result).toEqual({
        message: 'Movies retrived',
        data: {
          movie: [
            { id: '1', name: 'Avatar' },
            { id: '2', name: 'Titanic' },
          ],
          pagination: {
            total: 2,
            page: 1,
            limit: 10,
            totalMovies: 1,
          },
        },
      });
    });
  });

  describe('updateMovie', () => {
    it('should update movie successfully', async () => {
      databaseService.movie.update.mockResolvedValueOnce({
        id: '1',
        name: 'Updated',
      } as any);

      const result = await movieService.updateMovie('1', {
        name: 'Updated',
      } as any);

      expect(result).toEqual({
        message: 'Movie updated',
        data: { id: '1', name: 'Updated' },
      });
    });

    it('should throw NotFoundException if movie not found', async () => {
      databaseService.movie.update.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Not found', {
          code: 'P2025',
          clientVersion: '1.0.0',
        }),
      );

      await expect(
        movieService.updateMovie('999', { name: 'Does not exist' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteMovie', () => {
    it('should delete movie successfully', async () => {
      databaseService.movie.delete.mockResolvedValueOnce({
        id: '1',
        name: 'Deleted',
      } as any);

      const result = await movieService.deleteMovie('1');

      expect(result).toEqual({
        message: 'Movie deleted',
        data: { id: '1', name: 'Deleted' },
      });
    });

    it('should throw NotFoundException if movie not found', async () => {
      databaseService.movie.delete.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Not found', {
          code: 'P2025',
          clientVersion: '1.0.0',
        }),
      );

      await expect(movieService.deleteMovie('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
