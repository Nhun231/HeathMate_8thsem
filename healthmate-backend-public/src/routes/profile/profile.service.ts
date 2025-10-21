import { Injectable } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { ProfileRepository } from './profile.repo';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly hashingService: HashingService,
  ) {}

  // async getProfile(userId: string)
}
