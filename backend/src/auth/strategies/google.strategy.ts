import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  authorizationParams(): Record<string, string> {
    return {
      prompt: 'select_account', // or 'consent select_account' if you want the consent screen too
      include_granted_scopes: 'false',
    };
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile | undefined,
    done: VerifyCallback,
  ): Promise<any> {
    if (!profile) {
      // Fail gracefully if Google did not return a profile
      return done(new Error("Something went wrong on Google's side"), null);
    }

    const id = profile.id;
    const emails = profile.emails[0].value;
    const photos = profile.photos[0].value || '';
    const givenName = profile.name.givenName || '';
    const familyName = profile.name.familyName || '';

    const user = {
      googleId: id,
      email: emails,
      firstName: givenName,
      lastName: familyName,
      picture: photos,
      accessToken,
      refreshToken,
    };
    return done(null, user);
  }
}
