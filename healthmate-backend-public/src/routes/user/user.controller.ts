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
  constructor(private readonly usersService: UserService) {}

  @Get()
  async getUsers(@Query() query: Record<string, string>) {
    const parsed = QuerySchema.parse(query);
    return this.usersService.getUsers(parsed);
  }

  @Get('me')
  async getCurrentUser(@ActiveUser('userId') activeUserId: string) {
    return this.usersService.getUserById(activeUserId);
  }

  @Get(':userId')
  async getUser(@Param() params: GetUserDetailParamsDTO) {
    return this.usersService.getUserById(params.userId);
  }

  @Post()
  async createUser(
    @Body() body: CreateUserDTO,
    @ActiveUser('userId') activeUserId: string,
  ) {
    return this.usersService.createUser(body, activeUserId);
  }

  // @Put('me')
  // async updateCurrentUser(
  //   @ActiveUser('userId') activeUserId: string,
  //   @Body() body: UpdateUserDTO,
  // ) {
  //   return this.usersService.updateUser(activeUserId, body);
  // }

  @Put(':userId')
  async updateUser(
    @Param() params: GetUserDetailParamsDTO,
    @Body() body: UpdateUserDTO,
    @ActiveUser('userId') activeUserId: string,
  ) {
    return this.usersService.updateUser(params.userId, body, activeUserId);
  }

  @Delete(':userId')
  async deleteUser(
    @Param() params: DeleteUserDTO,
    @ActiveUser('userId') activeUserId: string,
  ): Promise<DeleteResult> {
    return this.usersService.deleteUser(params.userId, activeUserId);
  }
}
