import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    try {
      const { id, username, emails, photos } = profile;
      const email = emails?.[0]?.value;
      const avatar = photos?.[0]?.value;

      const user = {
        githubId: id,
        email,
        name: profile.displayName || username,
        avatar,
      };

      return await this.authService.validateGithubUser(user);
    } catch (error) {
      console.error('GitHub OAuth validation error:', error.message);
      throw new Error('Failed to authenticate with GitHub. Please ensure the database is connected.');
    }
  }
}