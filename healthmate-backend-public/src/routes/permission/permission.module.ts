import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { PermissionRepo } from './permission.repo';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Permission,
  PermissionSchema,
} from '../../shared/schemas/permission.schema';
import { Role, RoleSchema } from 'src/shared/schemas/role.schema';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepo],
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
    ]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
})
export class PermissionModule {}
