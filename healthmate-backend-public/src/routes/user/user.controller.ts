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
  async getUser(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Post()
  async createUser(@Body() body: any) {
    return this.usersService.createUser(body);
  }

  @Put('me')
  async updateCurrentUser(@ActiveUser('userId') userId: string, @Body() body: any) {
    return this.usersService.updateUser(userId, body);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

}
