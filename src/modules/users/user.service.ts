import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

type UserIdentifier = { email: string } | { id: string };

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findUser(identifier: UserIdentifier) {
    const user = await this.databaseService.user.findUnique({
      where: identifier,
    });
    return user;
  }

  async createUser(payload: CreateUserDto) {
    await this.findUser({ email: payload.email });

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const { password, ...user } = await this.databaseService.user.create({
      data: { ...payload, password: hashedPassword },
    });
    void password;
    return { message: 'Account created succesffuly', data: user };
  }
}
