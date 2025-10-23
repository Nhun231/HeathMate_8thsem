import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role, RoleSchema } from 'src/shared/schemas/role.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleRepo } from './role.repo';

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleRepo],
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
})
export class RoleModule {}
