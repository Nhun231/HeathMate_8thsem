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

import { QuerySchema } from 'src/shared/schemas/request/request.schema';

import { DeleteResult } from 'mongoose';
import { RoleService } from './role.service';
import {
  CreateRoleBodyDTO,
  GetRoleParamsDTO,
  UpdateRoleBodyDTO,
} from './role.dto';

@Controller('v1/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  list(@Query() query: Record<string, string>) {
    const parsed = QuerySchema.parse(query);
    return this.roleService.list(parsed);
  }

  @Get(':roleId')
  async findOne(@Param() params: GetRoleParamsDTO) {
    return this.roleService.findOne(params.roleId);
  }

  @Post()
  async create(@Body() body: CreateRoleBodyDTO) {
    return this.roleService.create(body);
  }

  @Put(':roleId')
  async update(
    @Param() params: GetRoleParamsDTO,
    @Body() body: UpdateRoleBodyDTO,
  ) {
    return this.roleService.update(params.roleId, body);
  }

  @Delete(':roleId')
  async delete(@Param() params: GetRoleParamsDTO): Promise<DeleteResult> {
    return this.roleService.delete(params.roleId);
  }
}
