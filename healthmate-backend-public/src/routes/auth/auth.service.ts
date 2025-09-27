import { HttpException, Injectable } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { TokenService } from 'src/shared/services/token.service';
import { RolesService } from './role.service';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { EmailService } from 'src/shared/services/email.service';
import { AuthRepository } from './auth.repo';
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
  TypeOfVerificationCode,
  TypeOfVerificationCodeType,
} from 'src/shared/constants/auth.constant';
import {
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
} from './schema/request/auth.request.schema';
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type';
import { generateOTP, isNotFoundError } from 'src/shared/utils/helper';
import { addMilliseconds } from 'date-fns';
import envConfig from 'src/shared/utils/config';
import ms, { StringValue } from 'ms';
import { RoleDocument } from 'src/shared/schemas/role.schema';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
  ) { }

  async register(body: RegisterBodyType) {
    try {
      const clientRoleId = await this.rolesService.getClientRole();

      console.log(clientRoleId);
      // Validate verification code
      await this.validateVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
      });

      // Hash the password
      const hashedPassword = await this.hashingService.hashPassword(
        body.password,
      );

      // Prepare user creation and verification code deletion
      const $createUser = this.authRepository.createUser({
        email: body.email,
        password: hashedPassword,
        fullname: body.fullname,
        gender: body.gender,
        dob: body.dob,
        phoneNumber: body.phoneNumber,
        roleId: clientRoleId,
      });

      const $deleteVerificationCode =
        this.authRepository.deleteVerificationCode({
          email: body.email,
          code: body.code,
          type: TypeOfVerificationCode.REGISTER,
        });

      // Execute both operations concurrently
      const [user] = await Promise.all([$createUser, $deleteVerificationCode]);

      return user;
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error code
        throw EmailAlreadyExistsException;
      }
      throw error;
    }
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
    const user = await this.sharedUserRepository.findUnique({
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
      userId: user._id,
      ip: body.ip,
      userAgent: body.userAgent,
    });

    const tokens = await this.generateTokens({
      userId: user._id.toString(),
      deviceId: device._id.toString(),
      roleId: (user.roleId as RoleDocument)._id.toString(),
      roleName: (user.roleId as RoleDocument).name,
    });

    return tokens;
  }

  async refreshToken({
    refreshToken,
    userAgent,
    ip,
  }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1. Verify refreshToken
      const { userId } =
        await this.tokenService.verifyRefreshToken(refreshToken);

      // 2. Find refreshToken in DB and populate user + role
      const refreshTokenInDB = await this.authRepository.findUniqueRefreshToken(
        { token: refreshToken },
      );

      if (!refreshTokenInDB) {
        throw RefreshTokenAlreadyUsedException;
      }

      const deviceId = refreshTokenInDB.deviceId;

      // If user populated with role
      const user = await this.sharedUserRepository.findUnique({
        _id: new Types.ObjectId(userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      const roleId = (user.roleId as RoleDocument)._id ?? user.roleId;
      const roleName = (user.roleId as RoleDocument).name ?? undefined;

      // 3. Update device
      const $updateDevice = this.authRepository.updateDevice(
        new Types.ObjectId(deviceId),
        {
          ip,
          userAgent,
        },
      );

      // 4. Delete old refreshToken
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({
        token: refreshToken,
      });

      // 5. Generate new tokens
      const $token = this.generateTokens({
        userId: userId.toString(),
        deviceId: deviceId,
        roleId: roleId.toString(),
        roleName,
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
      // 1. Kiểm tra refreshToken có hợp lệ không
      await this.tokenService.verifyRefreshToken(refreshToken);

      // 2. Xóa refreshToken trong database
      const deletedRefreshToken = await this.authRepository.deleteRefreshToken({
        token: refreshToken,
      });

      // 3. Vô hiệu hóa device
      if (deletedRefreshToken) {
        await this.authRepository.updateDevice(
          new Types.ObjectId(deletedRefreshToken.deviceId),
          {
            isActive: false,
          },
        );
      }
      return { message: 'Logout successfully' };
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      if (isNotFoundError(error)) {
        throw RefreshTokenAlreadyUsedException;
      }
      throw UnauthorizedAccessException;
    }
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
        email: email,
        code: code,
        type: type,
      });

    if (!verificationCode) {
      throw InvalidOTPException;
    } else if (verificationCode.expiresAt < new Date()) {
      throw OTPExpiredException;
    }

    return verificationCode;
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

    console.log(body.newPassword);
    console.log(user.password);
    // update new password
    const hashedPassword = await this.hashingService.hashPassword(newPassword);
    console.log(hashedPassword);

    const $updateUser = this.authRepository.updateUser(
      { _id: user._id },
      {
        password: hashedPassword,
      },
    );

    const $deleteVerificationCode = this.authRepository.deleteVerificationCode({
      email: email,
      code: code,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
    });

    await Promise.all([$updateUser, $deleteVerificationCode]);

    return {
      message: 'Update password successfully',
    };
  }
}
