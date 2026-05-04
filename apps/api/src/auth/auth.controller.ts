import { Controller, Post, Body, UseGuards, Request, Get, Res, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, VerifyEmailDto, ResendVerificationDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return {
      success: true,
      data: await this.authService.login(req.user),
    };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return {
      success: true,
      data: await this.authService.register(registerDto),
    };
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return {
      success: true,
      data: await this.authService.refreshTokens(refreshTokenDto.refreshToken),
    };
  }

  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return {
      success: true,
      data: await this.authService.verifyEmail(verifyEmailDto),
    };
  }

  @Post('resend-verification')
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto) {
    return {
      success: true,
      data: await this.authService.resendVerificationCode(resendVerificationDto),
    };
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // This endpoint initiates the GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req, @Res() res: Response) {
    try {
      // Generate JWT tokens for the authenticated user
      const authResult = await this.authService.login(req.user);

      // Redirect to frontend with tokens as query parameters
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${authResult.accessToken}&refreshToken=${authResult.refreshToken}`;

      res.redirect(redirectUrl);
    } catch (error) {
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
      res.redirect(`${frontendUrl}/login?error=${errorMessage}`);
    }
  }
}
