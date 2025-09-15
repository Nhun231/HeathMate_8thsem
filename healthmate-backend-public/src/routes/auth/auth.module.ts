import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repo';
import { RolesService } from './roles.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, RolesService],
})
export class AuthModule {}
