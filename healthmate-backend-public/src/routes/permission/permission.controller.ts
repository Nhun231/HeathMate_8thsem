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
import { PermissionService } from './permission.service';
import { QuerySchema } from 'src/shared/schemas/request/request.schema';
import {
  BulkUpdatePermissionBodyDTO,
  CreatePermissionBodyDTO,
  GetPermissionParamsDTO,
  UpdatePermissionBodyDTO,
} from './permission.dto';
import { DeleteResult } from 'mongoose';

@Controller('v1/permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  async list(@Query() query: Record<string, string>) {
    const parsed = QuerySchema.parse(query);
    return this.permissionService.list(parsed);
  }

  @Get(':permissionId')
  async findOne(@Param() params: GetPermissionParamsDTO) {
    return this.permissionService.findOne(params.permissionId);
  }

  @Post()
  async create(@Body() body: CreatePermissionBodyDTO) {
    return this.permissionService.create(body);
  }

  @Put('bulk-update-roles')
  async bulkUpdateRoles(@Body() body: BulkUpdatePermissionBodyDTO) {
    return this.permissionService.bulkUpdateRoles(body.updates);
  }

  @Put(':permissionId')
  async update(
    @Param() params: GetPermissionParamsDTO,
    @Body() body: UpdatePermissionBodyDTO,
  ) {
    return this.permissionService.update(params.permissionId, body);
  }

  @Delete(':permissionId')
  async delete(@Param() params: GetPermissionParamsDTO): Promise<DeleteResult> {
    return this.permissionService.delete(params.permissionId);
  }
}
