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
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { AuthGuard } from '../common/guards/auth.guard';
import { UserPathDto, UserQueryDto } from './dto/params.dto';
import { RolesGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { Role } from '../../../generated/prisma';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@UseInterceptors(ResponseInterceptor)
@Controller('/api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    return {
      message: 'Account created succesfully',
      data: user,
    };
  }

  @Get('/:id')
  async getUser(@Param() params: UserPathDto) {
    const user = await this.userService.getUser({ id: params.id });
    return { message: 'User updated', data: user };
  }

  @Get()
  async listUser(@Query() params: UserQueryDto) {
    const { data } = await this.userService.listUsers(
      params.query,
      params.page,
      params.limit,
    );
    return { message: 'User retrived', data };
  }

  @Put('/:id')
  async updateUser(
    @Param() params: UserPathDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.updateUser(params.id, updateUserDto);
    return { message: 'User updated', data: user };
  }

  @Delete('/:id')
  async deleteUser(@Param() params: UserPathDto) {
    const user = await this.userService.deleteUser(params.id);
    return { message: 'User deleted', data: user };
  }
}
