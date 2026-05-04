import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Check if user still exists and is verified
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isEmailVerified) {
      throw new UnauthorizedException('User not found or email not verified');
    }
    
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      isEmailVerified: user.isEmailVerified,
    };
  }
}
