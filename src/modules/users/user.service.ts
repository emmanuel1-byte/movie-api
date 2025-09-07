import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UserIdentifier } from './types/user.type';
import { User } from '../../../generated/prisma';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user;
    void password;
    return sanitized;
  }

  async createUser(payload: CreateUserDto) {
    await this.getUser({ email: payload.email });
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await this.databaseService.user.create({
      data: { ...payload, password: hashedPassword },
    });
    return this.sanitizeUser(user);
  }

  async listUsers(query: string, page: number, limit: number) {
    const users = await this.databaseService.user.findMany({
      where: {
        fullname: { contains: query, mode: 'insensitive' },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.databaseService.user.count();
    const totalUsers = Math.ceil(total / limit);

    return {
      data: {
        users: users.map((u) => this.sanitizeUser(u)),
        pagination: {
          total,
          page,
          limit,
          totalUsers,
        },
      },
    };
  }

  async getUser(identifier: UserIdentifier) {
    const user = await this.databaseService.user.findUnique({
      where: identifier,
    });
    return user;
  }

  async updateUser(userId: string, payload: UpdateUserDto) {
    const user = await this.databaseService.user.update({
      where: {
        id: userId,
      },
      data: payload,
    });
    return this.sanitizeUser(user);
  }

  async deleteUser(userId: string) {
    const user = await this.databaseService.user.delete({
      where: {
        id: userId,
      },
    });
    return this.sanitizeUser(user);
  }
}
