import { Test, TestingModule } from '@nestjs/testing';
import { GoogleService, getGoogleProfile } from '../google.service';
import { AuthRepository } from '../auth.repo';
import { HashingService } from 'src/shared/services/hashing.service';
import { RolesService } from '../role.service';
import { AuthService } from '../auth.service';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { OAuth2Client } from 'google-auth-library';
import { Gender } from 'src/shared/constants/auth.constant';

// ✅ Mock Google APIs
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        generateAuthUrl: jest.fn().mockReturnValue('mock-url'),
        getToken: jest
          .fn()
          .mockResolvedValue({ tokens: { access_token: 'token' } }),
        setCredentials: jest.fn(),
      })),
    },
    oauth2: jest.fn().mockReturnValue({
      userinfo: {
        get: jest.fn().mockResolvedValue({
          data: { email: 'test@gmail.com', name: 'John Doe', picture: 'pic' },
        }),
      },
    }),
    people: jest.fn().mockReturnValue({
      people: {
        get: jest.fn().mockResolvedValue({
          data: {
            genders: [{ value: 'male' }],
            birthdays: [{ date: { year: '1990', month: '01', day: '01' } }],
          },
        }),
      },
    }),
  },
}));

describe('GoogleService', () => {
  let googleService: GoogleService;

  // ✅ Mock dependencies
  const mockAuthRepository = {
    createUser: jest.fn(),
    createDevice: jest.fn(),
  };
  const mockHashingService = {
    hashPassword: jest.fn(),
  };
  const mockRolesService = {
    getClientRole: jest.fn(),
  };
  const mockAuthService = {
    generateTokens: jest.fn(),
  };
  const mockSharedUserRepository = {
    findUnique: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: HashingService, useValue: mockHashingService },
        { provide: RolesService, useValue: mockRolesService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SharedUserRepository, useValue: mockSharedUserRepository },
      ],
    }).compile();

    googleService = module.get<GoogleService>(GoogleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --------------------------------
  // ✅ getGoogleAuthUrl()
  // --------------------------------
  describe('getGoogleAuthUrl', () => {
    it('should generate google auth url with correct state', () => {
      const result = googleService.getGoogleAuthUrl({
        userAgent: 'Chrome',
        ip: '127.0.0.1',
      });

      expect(result.url).toBe('mock-url');
    });
  });

  // --------------------------------
  // ✅ googleCallback()
  // --------------------------------
  describe('googleCallback', () => {
    it('should create new user if not exists and return tokens', async () => {
      mockSharedUserRepository.findUnique.mockResolvedValue(null);
      mockRolesService.getClientRole.mockResolvedValue('role123');
      mockHashingService.hashPassword.mockResolvedValue('hashed-pass');
      mockAuthRepository.createUser.mockResolvedValue({
        id: 'user123',
        roleId: { _id: 'role123' },
      });
      mockAuthRepository.createDevice.mockResolvedValue({ id: 'device123' });
      mockAuthService.generateTokens.mockResolvedValue({
        access: 'a',
        refresh: 'r',
      });

      const state = Buffer.from(
        JSON.stringify({ userAgent: 'Chrome', ip: '127.0.0.1' }),
      ).toString('base64');
      const result = await googleService.googleCallback({
        code: 'auth-code',
        state,
      });

      expect(mockSharedUserRepository.findUnique).toHaveBeenCalledWith({
        email: 'test@gmail.com',
      });
      expect(mockAuthRepository.createUser).toHaveBeenCalled();
      expect(mockAuthRepository.createDevice).toHaveBeenCalled();
      expect(mockAuthService.generateTokens).toHaveBeenCalled();
      expect(result).toEqual({ access: 'a', refresh: 'r' });
    });

    it('should use existing user and generate tokens', async () => {
      mockSharedUserRepository.findUnique.mockResolvedValue({
        id: 'existing-user',
        roleId: { _id: 'role123' },
      });
      mockAuthRepository.createDevice.mockResolvedValue({ id: 'device123' });
      mockAuthService.generateTokens.mockResolvedValue({
        access: 'a',
        refresh: 'r',
      });

      const state = Buffer.from(
        JSON.stringify({ userAgent: 'Firefox', ip: '10.0.0.1' }),
      ).toString('base64');
      const result = await googleService.googleCallback({
        code: 'auth-code',
        state,
      });

      expect(mockSharedUserRepository.findUnique).toHaveBeenCalledWith({
        email: 'test@gmail.com',
      });
      expect(mockAuthRepository.createUser).not.toHaveBeenCalled();
      expect(mockAuthService.generateTokens).toHaveBeenCalled();
      expect(result).toEqual({ access: 'a', refresh: 'r' });
    });

    it('should handle invalid state parsing gracefully', async () => {
      mockSharedUserRepository.findUnique.mockResolvedValue({
        id: 'existing-user',
        roleId: { _id: 'role123' },
      });
      mockAuthRepository.createDevice.mockResolvedValue({ id: 'device123' });
      mockAuthService.generateTokens.mockResolvedValue({
        access: 'a',
        refresh: 'r',
      });

      const result = await googleService.googleCallback({
        code: 'auth-code',
        state: 'invalid-base64',
      });
      expect(result).toEqual({ access: 'a', refresh: 'r' });
    });

    it('should log and rethrow errors from repository', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockSharedUserRepository.findUnique.mockRejectedValue(
        new Error('Google API failed'),
      );

      const state = Buffer.from(
        JSON.stringify({ userAgent: 'Test', ip: '1.1.1.1' }),
      ).toString('base64');

      await expect(
        googleService.googleCallback({ code: 'auth-code', state }),
      ).rejects.toThrow('Google API failed');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Google authentication error:',
        expect.any(Error),
      );
    });
  });

  // --------------------------------
  // ✅ getGoogleProfile()
  // --------------------------------
  describe('getGoogleProfile', () => {
    it('should parse google profile correctly', async () => {
      const oauth2Client = new OAuth2Client();
      const result = await getGoogleProfile(oauth2Client);

      expect(result.email).toBe('test@gmail.com');
      expect(result.gender).toBe(Gender.Male);
      expect(result.birthday).toBe('1990-01-01');
    });
  });
});
