import { HttpException, Injectable } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { TokenService } from 'src/shared/services/token.service';
import { AuthRepository } from './auth.repo';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { EmailService } from 'src/shared/services/email.service';
import {
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
} from './auth.model';
import {
  TypeOfVerificationCode,
  TypeOfVerificationCodeType,
} from 'src/shared/constants/auth.constant';
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  InvalidPasswordException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  UnauthorizedAccessException,
} from './auth.error';
import {
  generateOTP,
  isNotFoundError,
  isUniqueConstraintError,
} from 'src/shared/helper';
import { addMilliseconds } from 'date-fns';
import envConfig from 'src/shared/config';
import ms, { StringValue } from 'ms';
import { RolesService } from './roles.service';
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
    private readonly rolesService: RolesService,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId();
      await this.validateVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
      });

      const hashedPassword = await this.hashingService.hashPassword(
        body.password,
      );

      const $createUser = this.authRepository.createUser({
        email: body.email,
        password: hashedPassword,
        roleId: clientRoleId,
      });

      const $deleteVerificationCode =
        this.authRepository.deleteVerificationCode({
          email_code_type: {
            email: body.email,
            code: body.code,
            type: TypeOfVerificationCode.REGISTER,
          },
        });

      const [user] = await Promise.all([$createUser, $deleteVerificationCode]);

      return user;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw EmailAlreadyExistsException;
      }
      throw error;
    }
  }

  async validateVerificationCode({
    email,
    code,
    type,
  }: {
    email: string;
    code: string;
    type: TypeOfVerificationCodeType;
  }) {
    const verificationCode =
      await this.authRepository.findUniqueVerificationCode({
        email_code_type: {
          email: email,
          code: code,
          type: type,
        },
      });

    if (!verificationCode) {
      throw InvalidOTPException;
    } else if (verificationCode.expiresAt < new Date()) {
      throw OTPExpiredException;
    }

    return verificationCode;
  }

  async sendOTP(body: SendOTPBodyType) {
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    });

    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException;
    }
    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw EmailNotFoundException;
    }

    const code = generateOTP();
    await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(
        new Date(),
        ms(envConfig.OTP_EXPIRES_IN as StringValue),
      ),
    });

    const { error } = await this.emailService.sendOTP({
      email: body.email,
      code,
    });

    if (error) {
      throw FailedToSendOTPException;
    }

    // return verificationCode;
    return { message: 'Send OTP to email successfully' };
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
    });

    if (!user) {
      throw EmailNotFoundException;
    }

    const isPasswordMatch = await this.hashingService.comparePassword(
      body.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw InvalidPasswordException;
    }

    const device = await this.authRepository.createDevice({
      userId: user.id,
      ip: body.ip,
      userAgent: body.userAgent,
    });

    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.role.id,
      roleName: user.role.name,
    });

    return tokens;
  }

  async generateTokens(payload: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId: payload.userId,
        deviceId: payload.deviceId,
        roleId: payload.roleId,
        roleName: payload.roleName,
      }),
      this.tokenService.signRefreshToken(payload),
    ]);

    const decodedRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken);

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: payload.userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId: payload.deviceId,
    });
    return { accessToken, refreshToken };
  }

  async refreshToken({
    refreshToken,
    userAgent,
    ip,
  }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    console.log(refreshToken);
    console.log(userAgent);
    console.log(ip);
    try {
      // verify refreshToken
      const { userId } =
        await this.tokenService.verifyRefreshToken(refreshToken);

      // check if refreshToken in database
      const refreshTokenInDB =
        await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
          token: refreshToken,
        });
      if (!refreshTokenInDB) {
        throw RefreshTokenAlreadyUsedException;
      }

      // update device
      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
      } = refreshTokenInDB;

      const $updateDevice = this.authRepository.updateDevice(deviceId, {
        ip,
        userAgent,
      });

      // delete old refreshToken
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({
        token: refreshToken,
      });

      // renew accessToken and refreshToken
      const $token = this.generateTokens({
        userId,
        roleId,
        roleName,
        deviceId,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, __, tokens] = await Promise.all([
        $updateDevice,
        $deleteRefreshToken,
        $token,
      ]);

      return tokens;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw UnauthorizedAccessException;
    }
  }

  async logout(refreshToken: string) {
    try {
      // verify refreshToken
      await this.tokenService.verifyRefreshToken(refreshToken);

      // delete refreshToken in database
      const deletedRefreshToken = await this.authRepository.deleteRefreshToken({
        token: refreshToken,
      });

      // deactivate device
      await this.authRepository.updateDevice(deletedRefreshToken.deviceId, {
        isActive: false,
      });

      return { message: 'Logout successfully' };
    } catch (error) {
      if (isNotFoundError(error)) {
        throw RefreshTokenAlreadyUsedException;
      }
      throw UnauthorizedAccessException;
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body;

    // check if email exists
    const user = await this.sharedUserRepository.findUnique({
      email: email,
    });
    if (!user) {
      throw EmailNotFoundException;
    }

    // validate verification code
    await this.validateVerificationCode({
      email: email,
      code: code,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
    });

    // update new password
    const hashedPassword = await this.hashingService.hashPassword(newPassword);
    const $updateUser = this.authRepository.updateUser(
      { id: user.id },
      {
        password: hashedPassword,
      },
    );

    const $deleteVerificationCode = this.authRepository.deleteVerificationCode({
      email_code_type: {
        email: email,
        code: code,
        type: TypeOfVerificationCode.FORGOT_PASSWORD,
      },
    });

    await Promise.all([$updateUser, $deleteVerificationCode]);

    return {
      message: 'Update password successfully',
    };
  }
}
