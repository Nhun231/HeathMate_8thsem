import { Injectable } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { ProfileRepository } from './profile.repo';
import { Types } from 'mongoose';
import {
  ChangePasswordBodyType,
  UpdateUserBodyType,
} from './schema/request/profile.request.schema';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import {
  InvalidPasswordException,
  NotFoundProfileRecordException,
} from './profile.error';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly hashingService: HashingService,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async getProfile(userId: string) {
    return this.profileRepo.findOne(new Types.ObjectId(userId));
  }

  async updateProfile(userId: string, data: UpdateUserBodyType) {
    return this.profileRepo.update(new Types.ObjectId(userId), data);
  }

  async changePassword(
    userId: string,
    body: Omit<ChangePasswordBodyType, 'confirmNewPassword'>,
  ) {
    const { password, newPassword } = body;

    const user = await this.sharedUserRepository.findUnique({
      _id: new Types.ObjectId(userId),
    });
    if (!user) {
      throw NotFoundProfileRecordException;
    }

    const isPasswordMatch = await this.hashingService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw InvalidPasswordException;
    }

    const hashedPassword = await this.hashingService.hashPassword(newPassword);

    await this.profileRepo.update(new Types.ObjectId(userId), {
      password: hashedPassword,
    });

    return {
      message: 'Password changed successfully',
    };
  }
}
