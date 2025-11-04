import { ProfileService } from '../profile.service';
import { ProfileRepository } from '../profile.repo';
import { HashingService } from 'src/shared/services/hashing.service';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import {
  InvalidPasswordException,
  NotFoundProfileRecordException,
} from '../profile.error';
import { Types } from 'mongoose';

describe('ProfileService', () => {
  let service: ProfileService;
  let profileRepo: jest.Mocked<ProfileRepository>;
  let hashingService: jest.Mocked<HashingService>;
  let sharedUserRepository: jest.Mocked<SharedUserRepository>;

  beforeEach(() => {
    profileRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
    } as any;

    hashingService = {
      comparePassword: jest.fn(),
      hashPassword: jest.fn(),
    } as any;

    sharedUserRepository = {
      findUnique: jest.fn(),
    } as any;

    service = new ProfileService(
      profileRepo,
      hashingService,
      sharedUserRepository,
    );
  });

  describe('getProfile', () => {
    it('should call profileRepo.findOne with correct ObjectId', async () => {
      const id = new Types.ObjectId().toString();
      await service.getProfile(id);
      expect(profileRepo.findOne).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
      );
    });
  });

  describe('updateProfile', () => {
    it('should call profileRepo.update with correct args', async () => {
      const id = new Types.ObjectId().toString();
      const data = { name: 'John Doe' } as any;
      await service.updateProfile(id, data);
      expect(profileRepo.update).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        data,
      );
    });
  });

  describe('changePassword', () => {
    const userId = new Types.ObjectId().toString();
    const password = 'oldPassword';
    const newPassword = 'newPassword';

    it('should throw NotFoundProfileRecordException if user not found', async () => {
      sharedUserRepository.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword(userId, { password, newPassword }),
      ).rejects.toBe(NotFoundProfileRecordException);
    });

    it('should throw InvalidPasswordException if password mismatch', async () => {
      sharedUserRepository.findUnique.mockResolvedValue({
        password: 'hashed',
      } as any);
      hashingService.comparePassword.mockResolvedValue(false);

      await expect(
        service.changePassword(userId, { password, newPassword }),
      ).rejects.toBe(InvalidPasswordException);
    });

    it('should update password and return success message on success', async () => {
      sharedUserRepository.findUnique.mockResolvedValue({
        password: 'hashed',
      } as any);
      hashingService.comparePassword.mockResolvedValue(true);
      hashingService.hashPassword.mockResolvedValue('hashedNew');
      profileRepo.update.mockResolvedValue({} as any);

      const result = await service.changePassword(userId, {
        password,
        newPassword,
      });

      expect(hashingService.comparePassword).toHaveBeenCalledWith(
        password,
        'hashed',
      );
      expect(hashingService.hashPassword).toHaveBeenCalledWith(newPassword);
      expect(profileRepo.update).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        { password: 'hashedNew' },
      );
      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('should rethrow any unexpected error', async () => {
      sharedUserRepository.findUnique.mockRejectedValue(new Error('DB error'));

      await expect(
        service.changePassword(userId, { password, newPassword }),
      ).rejects.toThrow('DB error');
    });
  });
});
