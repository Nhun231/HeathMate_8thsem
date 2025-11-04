import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './../auth.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { TokenService } from 'src/shared/services/token.service';
import { RolesService } from './../role.service';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { EmailService } from 'src/shared/services/email.service';
import { AuthRepository } from './../auth.repo';
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  InvalidPasswordException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  UserOfRefreshTokenNotFoundException,
} from './../auth.error';
import {
  Gender,
  TypeOfVerificationCode,
} from 'src/shared/constants/auth.constant';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;

  const hashingService = {
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
  };

  const tokenService = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const rolesService = { getCustomerRole: jest.fn() };

  const sharedUserRepository = { findUnique: jest.fn() };

  const emailService = { sendOTP: jest.fn() };

  const authRepository = {
    createUser: jest.fn(),
    deleteVerificationCode: jest.fn(),
    createVerificationCode: jest.fn(),
    findUniqueVerificationCode: jest.fn(),
    createDevice: jest.fn(),
    createRefreshToken: jest.fn(),
    findUniqueRefreshToken: jest.fn(),
    updateDevice: jest.fn(),
    deleteRefreshToken: jest.fn(),
    updateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: HashingService, useValue: hashingService },
        { provide: TokenService, useValue: tokenService },
        { provide: RolesService, useValue: rolesService },
        { provide: AuthRepository, useValue: authRepository },
        { provide: SharedUserRepository, useValue: sharedUserRepository },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const body = {
      email: 'test@example.com',
      password: '123456',
      confirmPassword: '123456',
      fullname: 'Test User',
      gender: Gender.Male,
      dob: new Date(),
      phoneNumber: '123456789',
      code: '1234',
    };

    it('should register successfully', async () => {
      rolesService.getCustomerRole.mockResolvedValue('clientRoleId');
      jest
        .spyOn(authService, 'validateVerificationCode')
        .mockResolvedValue({} as any);
      hashingService.hashPassword.mockResolvedValue('hashed');
      authRepository.createUser.mockResolvedValue({ id: 'userId' });
      authRepository.deleteVerificationCode.mockResolvedValue(true);

      const result = await authService.register(body);

      expect(result).toEqual({ id: 'userId' });
      expect(hashingService.hashPassword).toHaveBeenCalledWith('123456');
    });

    it('should throw EmailAlreadyExistsException on duplicate email', async () => {
      rolesService.getCustomerRole.mockResolvedValue('clientRoleId');
      jest
        .spyOn(authService, 'validateVerificationCode')
        .mockResolvedValue({} as any);
      authRepository.createUser.mockRejectedValue({ code: 11000 });

      await expect(authService.register(body)).rejects.toBe(
        EmailAlreadyExistsException,
      );
    });
  });

  describe('sendOTP', () => {
    const body = {
      email: 'user@mail.com',
      type: TypeOfVerificationCode.REGISTER,
    };

    it('should send OTP successfully', async () => {
      sharedUserRepository.findUnique.mockResolvedValue(null);
      authRepository.createVerificationCode.mockResolvedValue({});
      emailService.sendOTP.mockResolvedValue({ error: null });

      const result = await authService.sendOTP(body);
      expect(result.message).toContain('Send OTP');
    });

    it('should throw EmailAlreadyExistsException if email exists for REGISTER', async () => {
      sharedUserRepository.findUnique.mockResolvedValue({
        id: '5c8a34ed14eb5c17645c9108',
      });

      await expect(authService.sendOTP(body)).rejects.toBe(
        EmailAlreadyExistsException,
      );
    });

    it('should throw EmailNotFoundException for FORGOT_PASSWORD', async () => {
      sharedUserRepository.findUnique.mockResolvedValue(null);

      await expect(
        authService.sendOTP({
          ...body,
          type: TypeOfVerificationCode.FORGOT_PASSWORD,
        }),
      ).rejects.toBe(EmailNotFoundException);
    });

    it('should throw FailedToSendOTPException if email service fails', async () => {
      sharedUserRepository.findUnique.mockResolvedValue(null);
      authRepository.createVerificationCode.mockResolvedValue({});
      emailService.sendOTP.mockResolvedValue({ error: true });

      await expect(authService.sendOTP(body)).rejects.toBe(
        FailedToSendOTPException,
      );
    });
  });

  describe('login', () => {
    const body = {
      email: 'a@b.com',
      password: 'pass',
      userAgent: 'ua',
      ip: '127.0.0.1',
    };

    it('should login successfully', async () => {
      sharedUserRepository.findUnique.mockResolvedValue({
        _id: 'userId',
        password: 'hashed',
        roleId: { _id: 'roleId', name: 'client' },
      });
      hashingService.comparePassword.mockResolvedValue(true);
      authRepository.createDevice.mockResolvedValue({ _id: 'deviceId' });
      const generateTokensSpy = jest
        .spyOn(authService, 'generateTokens')
        .mockResolvedValue({
          accessToken: 'access',
          refreshToken: 'refresh',
        });

      const result = await authService.login(body);
      expect(result.accessToken).toBe('access');
      expect(generateTokensSpy).toHaveBeenCalled();
    });

    it('should throw EmailNotFoundException', async () => {
      sharedUserRepository.findUnique.mockResolvedValue(null);
      await expect(authService.login(body)).rejects.toBe(
        EmailNotFoundException,
      );
    });

    it('should throw InvalidPasswordException', async () => {
      sharedUserRepository.findUnique.mockResolvedValue({ password: 'x' });
      hashingService.comparePassword.mockResolvedValue(false);
      await expect(authService.login(body)).rejects.toBe(
        InvalidPasswordException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      tokenService.verifyRefreshToken.mockResolvedValue({
        userId: '68cad52bf265db78dc9977c5',
      });
      authRepository.findUniqueRefreshToken.mockResolvedValue({
        deviceId: '5c8a34ed14eb5c17645c9108',
      });
      sharedUserRepository.findUnique.mockResolvedValue({
        id: '5c8a34ed14eb5c17645c9108',
        roleId: { id: '5c8a34ed14eb5c17645c9108', name: 'Client' },
      });
      authRepository.updateDevice.mockResolvedValue(true);
      authRepository.deleteRefreshToken.mockResolvedValue(true);
      jest.spyOn(authService, 'generateTokens').mockResolvedValue({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNhZDUyYmYyNjVkYjc4ZGM5OTc3YzUiLCJkZXZpY2VJZCI6IjY4ZGQzOGRjYmIyZDZkY2Y3Y2QwNzA1MSIsInJvbGVJZCI6IjY4Y2FkNGY2ZWM4YzRjOGNkMzY5NGNlZCIsInJvbGVOYW1lIjoiQ3VzdG9tZXIiLCJ1dWlkIjoiZDM0MGI5NjctYzgzYi00ZGJlLWJmOTYtYTljYzY2ZjEyY2Q1IiwiaWF0IjoxNzU5NTA4NTUyLCJleHAiOjE3NTk3Njc3NTJ9.Udi9G54Vznp3_O68ZXmbAeS14ZsMd8I0FkrvP7ZDbxo',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNhZDUyYmYyNjVkYjc4ZGM5OTc3YzUiLCJkZXZpY2VJZCI6IjY4ZGQzOGRjYmIyZDZkY2Y3Y2QwNzA1MSIsInJvbGVJZCI6IjY4Y2FkNGY2ZWM4YzRjOGNkMzY5NGNlZCIsInJvbGVOYW1lIjoiQ3VzdG9tZXIiLCJ1dWlkIjoiZDM0MGI5NjctYzgzYi00ZGJlLWJmOTYtYTljYzY2ZjEyY2Q1IiwiaWF0IjoxNzU5NTA4NTUyLCJleHAiOjE3NTk3Njc3NTJ9.Udi9G54Vznp3_O68ZXmbAeS14ZsMd8I0FkrvP7ZDbxo',
      });

      const result = await authService.refreshToken({
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNhZDUyYmYyNjVkYjc4ZGM5OTc3YzUiLCJkZXZpY2VJZCI6IjY4ZGQzOGRjYmIyZDZkY2Y3Y2QwNzA1MSIsInJvbGVJZCI6IjY4Y2FkNGY2ZWM4YzRjOGNkMzY5NGNlZCIsInJvbGVOYW1lIjoiQ3VzdG9tZXIiLCJ1dWlkIjoiZDM0MGI5NjctYzgzYi00ZGJlLWJmOTYtYTljYzY2ZjEyY2Q1IiwiaWF0IjoxNzU5NTA4NTUyLCJleHAiOjE3NTk3Njc3NTJ9.Udi9G54Vznp3_O68ZXmbAeS14ZsMd8I0FkrvP7ZDbxo',
        userAgent: 'ua',
        ip: '1.1.1.1',
      });

      expect(result.accessToken).toBeDefined();
      expect(authRepository.deleteRefreshToken).toHaveBeenCalled();
    });

    it('should throw RefreshTokenAlreadyUsedException if token not found in DB', async () => {
      tokenService.verifyRefreshToken.mockResolvedValue({
        userId: '68cad52bf265db78dc9977c5',
      });
      authRepository.findUniqueRefreshToken.mockResolvedValue(null);

      await expect(
        authService.refreshToken({
          refreshToken: 'invalid',
          userAgent: 'ua',
          ip: '1.1.1.1',
        }),
      ).rejects.toBe(RefreshTokenAlreadyUsedException);
    });

    it('should throw NotFoundException if user not found', async () => {
      tokenService.verifyRefreshToken.mockResolvedValue({
        userId: '68cad52bf265db78dc9977c5',
      });
      authRepository.findUniqueRefreshToken.mockResolvedValue({
        deviceId: '5c8a34ed14eb5c17645c9108',
      });
      sharedUserRepository.findUnique.mockResolvedValue(null);

      await expect(
        authService.refreshToken({
          refreshToken: 'valid',
          userAgent: 'ua',
          ip: '1.1.1.1',
        }),
      ).rejects.toBe(UserOfRefreshTokenNotFoundException);
    });
  });

  describe('validateVerificationCode', () => {
    it('should throw InvalidOTPException when not found', async () => {
      authRepository.findUniqueVerificationCode.mockResolvedValue(null);
      await expect(
        authService.validateVerificationCode({
          email: 'a',
          code: 'b',
          type: TypeOfVerificationCode.REGISTER,
        }),
      ).rejects.toBe(InvalidOTPException);
    });

    it('should throw OTPExpiredException when expired', async () => {
      authRepository.findUniqueVerificationCode.mockResolvedValue({
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(
        authService.validateVerificationCode({
          email: 'a',
          code: 'b',
          type: TypeOfVerificationCode.REGISTER,
        }),
      ).rejects.toBe(OTPExpiredException);
    });

    it('should return code when valid', async () => {
      const code = { expiresAt: new Date(Date.now() + 10000) };
      authRepository.findUniqueVerificationCode.mockResolvedValue(code);
      const result = await authService.validateVerificationCode({
        email: 'a',
        code: 'b',
        type: TypeOfVerificationCode.REGISTER,
      });
      expect(result).toEqual(code);
    });
  });

  describe('forgotPassword', () => {
    const body = {
      email: 'a',
      code: '1234',
      newPassword: 'new',
      confirmNewPassword: 'new',
    };

    it('should update password successfully', async () => {
      sharedUserRepository.findUnique.mockResolvedValue({
        _id: '5c8a34ed14eb5c17645c9108',
        password: 'old',
      });
      jest
        .spyOn(authService, 'validateVerificationCode')
        .mockResolvedValue(true as any);
      hashingService.hashPassword.mockResolvedValue('hashed');
      authRepository.updateUser.mockResolvedValue(true);
      authRepository.deleteVerificationCode.mockResolvedValue(true);

      const result = await authService.forgotPassword(body);
      expect(result.message).toContain('successfully');
    });

    it('should throw EmailNotFoundException', async () => {
      sharedUserRepository.findUnique.mockResolvedValue(null);
      await expect(authService.forgotPassword(body)).rejects.toBe(
        EmailNotFoundException,
      );
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      tokenService.signAccessToken.mockResolvedValue('access');
      tokenService.signRefreshToken.mockResolvedValue('refresh');
      tokenService.verifyRefreshToken.mockResolvedValue({
        exp: Math.floor(Date.now() / 1000) + 1000,
      });
      authRepository.createRefreshToken.mockResolvedValue(true);

      const result = await authService.generateTokens({
        userId: '5c8a34ed14eb5c17645c9108',
        deviceId: '5c8a34ed14eb5c17645c9108',
        roleId: '5c8a34ed14eb5c17645c9108',
        roleName: 'client',
      });

      expect(result).toEqual({
        accessToken: 'access',
        refreshToken: 'refresh',
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      tokenService.verifyRefreshToken.mockResolvedValue({
        userId: '5c8a34ed14eb5c17645c9108',
      });
      authRepository.deleteRefreshToken.mockResolvedValue({
        deviceId: '5c8a34ed14eb5c17645c9108',
      });
      authRepository.updateDevice.mockResolvedValue(true);

      const result = await authService.logout('refresh');
      expect(result.message).toContain('Logout');
    });

    it('should throw RefreshTokenAlreadyUsedException if token not found', async () => {
      tokenService.verifyRefreshToken.mockResolvedValue({
        userId: '5c8a34ed14eb5c17645c9108',
      });
      authRepository.deleteRefreshToken.mockRejectedValue({
        name: 'DocumentNotFoundError',
      });

      await expect(authService.logout('refresh')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedAccessException for generic error', async () => {
      tokenService.verifyRefreshToken.mockRejectedValue(new Error('invalid'));

      await expect(authService.logout('refresh')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
