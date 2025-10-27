import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Redirect,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  // Redirect to google signin service (external)
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req, @Res() res) {
    // Initiates the Google OAuth process
  }

  // Google redirects here after signin
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req: Request, @Res() res: Response) {
    if (!req) {
      throw new BadRequestException('No request object found');
    }
    const { accessToken } = await this.authService.googleLogin(req);
    // Redirect with token in query param for localStorage storage
    res.redirect(
      `${process.env.REACT_APP_BASE_URL}/login?token=${accessToken}`,
    );
  }

  @Get('/status')
  async loginStatus(@Request() req): Promise<any> {
    return this.authService.status(req);
  }

  // logout
  @Get('logout')
  @HttpCode(200)
  @Redirect(`${process.env.REACT_APP_BASE_URL}/login`, 302)
  async logout(@Res() res: Response) {
    // No cookies to clear, just redirect
    return;
  }
}
