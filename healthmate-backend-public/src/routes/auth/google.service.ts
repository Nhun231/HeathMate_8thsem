import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import envConfig from 'src/shared/utils/config';
import { AuthRepository } from './auth.repo';
import { HashingService } from 'src/shared/services/hashing.service';
import { RolesService } from './role.service';
import { AuthService } from './auth.service';
import { GoogleAuthStateType } from './schema/request/auth.request.schema';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { Gender, GenderType } from 'src/shared/constants/auth.constant';

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client;
  private uuid: () => string;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authService: AuthService,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    );

    void import('uuid').then((module) => {
      this.uuid = module.v4;
    });
  }

  getGoogleAuthUrl({ userAgent, ip }: GoogleAuthStateType) {
    const scope = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const stateString = Buffer.from(
      JSON.stringify({
        userAgent,
        ip,
      }),
    ).toString('base64');

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      include_granted_scopes: true,
      state: stateString,
      prompt: 'consent',
    });
    return { url };
  }

  async googleCallback({ code, state }: { code: string; state: string }) {
    try {
      let userAgent;
      let ip;

      try {
        if (state) {
          const clientInfo = JSON.parse(
            Buffer.from(state, 'base64').toString('utf-8'),
          ) as GoogleAuthStateType;
          userAgent = clientInfo.userAgent ?? 'Unknown';
          ip = clientInfo.ip ?? 'Unknown';
        }
      } catch (error) {
        console.log('Failed to parse state', error);
      }

      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      const profile = await getGoogleProfile(this.oauth2Client);

      let user = await this.sharedUserRepository.findUnique({
        email: profile.email,
      });

      // If not user, create new account
      if (!user) {
        const clientRoleId = await this.rolesService.getClientRole();
        const randomPassword = this.uuid();
        const hashedPassword =
          await this.hashingService.hashPassword(randomPassword);

        user = await this.authRepository.createUser({
          email: profile.email,
          fullname: profile.name || 'No Name',
          password: hashedPassword,
          phoneNumber: '',
          roleId: clientRoleId,
          avatar: profile.picture,
          gender: profile.gender || Gender.Male,
          dob: profile.birthday ? new Date(profile.birthday) : undefined,
        });
      }

      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent,
        ip,
      });

      const roleId = user.roleId._id.toString();

      const authTokens = await this.authService.generateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: roleId,
        roleName: '', // TODO: fetch
      });

      return authTokens;
    } catch (error) {
      console.log('Google authentication error:', error);
      throw error;
    }
  }
}
export interface GoogleProfile {
  email: string;
  name?: string;
  picture?: string;
  gender?: GenderType;
  locale?: string;
  birthday?: string;
}

export async function getGoogleProfile(
  oauth2Client: OAuth2Client,
): Promise<GoogleProfile> {
  const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
  const { data } = await oauth2.userinfo.get();

  if (!data.email) {
    throw new Error('Google user has no email');
  }

  const people = google.people({ version: 'v1', auth: oauth2Client });
  const profile = await people.people.get({
    resourceName: 'people/me',
    personFields: 'genders,birthdays,locales',
  });

  let gender: GenderType | undefined;
  if (profile.data.genders?.length) {
    const g = profile.data.genders[0].value;
    gender =
      g === 'male' ? Gender.Male : g === 'female' ? Gender.Female : undefined;
  }

  let birthday: string | undefined;
  if (profile.data.birthdays?.length && profile.data.birthdays[0].date) {
    const { year, month, day } = profile.data.birthdays[0].date;
    birthday = `${year || '0000'}-${month}-${day}`;
  }

  return {
    email: data.email,
    name: data.name || undefined,
    picture: data.picture || undefined,
    gender,
    locale: data.locale || undefined,
    birthday,
  };
}
