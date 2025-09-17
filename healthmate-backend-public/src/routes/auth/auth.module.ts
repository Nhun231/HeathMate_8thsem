import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from 'src/shared/schemas/device.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from 'src/shared/schemas/refreshToken.schema';
import { Role, RoleSchema } from 'src/shared/schemas/role.schema';
import { User, UserSchema } from 'src/shared/schemas/user.schema';
import {
  VerificationCode,
  VerificationCodeSchema,
} from 'src/shared/schemas/verificationCode.schema';
import { RolesService } from './role.service';
import { AuthRepository } from './auth.repo';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesService, AuthRepository],
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: VerificationCode.name, schema: VerificationCodeSchema },
    ]),
  ],
})
export class AuthModule {}
