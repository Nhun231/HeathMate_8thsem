import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { QuerySchema } from 'src/shared/schemas/request/request.schema';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';

import {
  CreateUserDTO,
  DeleteUserDTO,
  GetUserDetailParamsDTO,
  UpdateUserDTO,
} from './user.dto';
import { DeleteResult } from 'mongoose';

@Controller('v1/users')
export class UserController {
  constructor(private readonly usersService: UserService) { }

  @Get()
  async getUsers(@Query() query: Record<string, string>) {
    const parsed = QuerySchema.parse(query);
    return this.usersService.getUsers(parsed);
  }

  @Get('me')
  async getCurrentUser(@ActiveUser('userId') userId: string) {
    return this.usersService.getUserById(userId);
  }

  @Get(':id')
  async getUser(@Param() params: GetUserDetailParamsDTO) {
    return this.usersService.getUserById(params.id);
  }

  @Post()
  async createUser(@Body() body: CreateUserDTO) {
    return this.usersService.createUser(body);
  }

  @Put('me')
  async updateCurrentUser(
    @ActiveUser('userId') userId: string,
    @Body() body: UpdateUserDTO,
  ) {
    return this.usersService.updateUser(userId, body);
  }

  @Put(':id')
  async updateUser(
    @Param() params: GetUserDetailParamsDTO,
    @Body() body: UpdateUserDTO,
  ) {
    return this.usersService.updateUser(params.id, body);
  }

  @Delete(':id')
  async deleteUser(@Param() params: DeleteUserDTO): Promise<DeleteResult> {
    return this.usersService.deleteUser(params.id);
  }
}
