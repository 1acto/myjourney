import { BadRequestException, Injectable, Request } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  // เพิ่ม google Login เข้ามา
  async googleLogin(req: any): Promise<any> {
    if (!req.user) {
      throw new BadRequestException('Google login failed: No user.');
    }
    console.log('Google user info:', req.user);
    // Extract user information from Google OAuth response
    const email = req.user.email;
    const firstName = req.user.firstName || req.user.given_name;
    const lastName = req.user.lastName || req.user.family_name;
    const avatar = req.user.picture;
    const googleId = req.user.googleId || req.user.id;

    // Check if user already exists in our database
    let user = await this.userService.user({ email });

    if (!user) {
      user = await this.userService.createUser({
        email,
        firstName,
        lastName,
        googleId,
        avatar,
      });
    }

    // Include user id in the JWT payload as `sub` so downstream guards can identify the user
    const payload = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  // Check JWT token validity
  async status(request: any): Promise<any> {
    const token = request.cookies['access_token'];
    try {
      const inputpayload = await this.jwtService.verify(token);
      return { login: true };
    } catch (e) {
      return { login: false };
    }
  }
}
