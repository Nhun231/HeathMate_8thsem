import { Global, Module } from '@nestjs/common';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/access-token.guard';
import { APIKeyGuard } from './guards/api-key.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/authentication.guard';
import { SharedUserRepository } from './repositories/shared-user.repo';
import { EmailService } from './services/email.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { Device, DeviceSchema } from './schemas/device.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refreshToken.schema';
import {
  VerificationCode,
  VerificationCodeSchema,
} from './schemas/verificationCode.schema';

const sharedServices = [
  TokenService,
  HashingService,
  SharedUserRepository,
  EmailService,
];

@Global()
@Module({
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    APIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: sharedServices,
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    MongooseModule.forFeature([
      { name: VerificationCode.name, schema: VerificationCodeSchema },
    ]),
    JwtModule,
  ],
})
export class SharedModule {}
