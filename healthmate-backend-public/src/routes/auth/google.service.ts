import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import envConfig from 'src/shared/config';
import { AuthRepository } from './auth.repo';
import { HashingService } from 'src/shared/services/hashing.service';
import { RolesService } from './role.service';
import { AuthService } from './auth.service';
import { GoogleUserInfoError } from './auth.error';
import { GoogleAuthStateType } from './schema/request/auth.request.schema';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';

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

      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2',
      });

      const { data } = await oauth2.userinfo.get();
      if (!data.email) {
        throw GoogleUserInfoError;
      }

      let user = await this.sharedUserRepository.findUnique({
        email: data.email,
      });

      // if not user, create new account
      if (!user) {
        const clientRoleId = await this.rolesService.getClientRole();
        const randomPassword = this.uuid();
        const hashedPassword =
          await this.hashingService.hashPassword(randomPassword);

        user = await this.authRepository.createUser({
          email: data.email,
          fullname: data.name || 'No Name',
          password: hashedPassword,
          phoneNumber: '',
          roleId: clientRoleId,
          avatar: data.picture || '',
          gender: data.gender || '',
        });
      }
      console.log(user);

      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent: userAgent,
        ip: ip,
      });

      const roleId = user.roleId._id.toString();
      // const roleName = user.roleId.

      const authTokens = await this.authService.generateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: roleId,
        roleName: '',
      });

      return authTokens;
    } catch (error) {
      console.log('Google authentication error:', error);
      throw error;
    }
  }
}
