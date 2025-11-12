import { Body, Controller, Get, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { ChangePasswordBodyDTO, UpdateUserProfileBodyDTO } from './profile.dto';

@Controller('v1/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getCurrentUser(@ActiveUser('userId') activeUserId: string) {
    return this.profileService.getProfile(activeUserId);
  }

  @Put()
  async updateProfile(
    @ActiveUser('userId') activeUserId: string,
    @Body() body: UpdateUserProfileBodyDTO,
  ) {
    return this.profileService.updateProfile(activeUserId, body);
  }

  @Put('change-password')
  async changePassword(
    @ActiveUser('userId') activeUserId: string,
    @Body() body: ChangePasswordBodyDTO,
  ) {
    return this.profileService.changePassword(activeUserId, body);
  }
}
