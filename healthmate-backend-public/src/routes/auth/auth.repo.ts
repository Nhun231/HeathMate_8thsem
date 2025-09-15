import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  DeviceType,
  RefreshTokenType,
  RoleType,
  VerificationCodeType,
} from './auth.model';
import { UserType } from 'src/shared/models/shared-user.model';
import { TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    user: Pick<UserType, 'email' | 'password' | 'roleId'>,
  ): Promise<Omit<UserType, 'password'>> {
    console.log(user);

    const userCreate = await this.prismaService.user.create({
      data: {
        email: user.email,
        password: user.password,
        roleId: user.roleId,
      },
      include: { role: true },
      omit: {
        password: true,
      },
    });

    return userCreate;
  }

  async createUserIncludeRole(
    user: Pick<UserType, 'email' | 'password' | 'roleId'>,
  ): Promise<UserType & { role: RoleType }> {
    // console.log(user);

    return this.prismaService.user.create({
      data: {
        email: user.email,
        password: user.password,
        roleId: user.roleId,
      },
      include: { role: true },
    });
  }

  createVerificationCode(
    payload: Pick<
      VerificationCodeType,
      'email' | 'type' | 'code' | 'expiresAt'
    >,
  ): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.upsert({
      where: {
        email_code_type: {
          email: payload.email,
          code: payload.code,
          type: payload.type,
        },
      },
      create: {
        ...payload,
        type: payload.type,
      },
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    });
  }

  async findUniqueVerificationCode(
    uniqueValue:
      | { id: number }
      | {
          email_code_type: {
            email: string;
            code: string;
            type: TypeOfVerificationCodeType;
          };
        },
  ): Promise<VerificationCodeType | null> {
    console.log(uniqueValue);
    console.log(
      await this.prismaService.verificationCode.findUnique({
        where: uniqueValue,
      }),
    );

    return await this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    });
  }

  async deleteVerificationCode(
    uniqueValue:
      | { id: number }
      | {
          email_code_type: {
            email: string;
            code: string;
            type: TypeOfVerificationCodeType;
          };
        },
  ): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.delete({
      where: uniqueValue,
    });
  }

  async createRefreshToken(data: {
    token: string;
    userId: number;
    expiresAt: Date;
    deviceId: number;
  }) {
    return await this.prismaService.refreshToken.create({
      data,
    });
  }

  async createDevice(
    data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> &
      Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
  ) {
    return await this.prismaService.device.create({
      data,
    });
  }

  async findUniqueUserIncludeRole(
    uniqueObject: { email: string } | { id: number },
  ): Promise<(UserType & { role: RoleType }) | null> {
    return this.prismaService.user.findUnique({
      where: uniqueObject,
      include: { role: true },
    });
  }

  async findUniqueRefreshTokenIncludeUserRole(uniqueObject: {
    token: string;
  }): Promise<
    | (RefreshTokenType & {
        user: UserType & { role: RoleType };
        device: DeviceType;
      })
    | null
  > {
    return this.prismaService.refreshToken.findUnique({
      where: uniqueObject,
      include: {
        user: {
          include: {
            role: true,
          },
        },
        device: true,
      },
    });
  }

  async updateDevice(deviceId: number, data: Partial<DeviceType>) {
    return this.prismaService.device.update({
      where: { id: deviceId },
      data,
    });
  }

  deleteRefreshToken(uniqueObject: {
    token: string;
  }): Promise<RefreshTokenType> {
    return this.prismaService.refreshToken.delete({
      where: uniqueObject,
    });
  }
}
