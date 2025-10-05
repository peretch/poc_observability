import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      provider: 'local',
    });

    const session = await this.sessionsService.create(user.id);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
      accessToken: this.jwtService.sign({ 
        sub: user.id, 
        email: user.email,
        sessionId: session.id,
      }),
      refreshToken: session.refreshToken,
    };
  }

  async login(user: User) {
    const session = await this.sessionsService.create(user.id);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
      accessToken: this.jwtService.sign({ 
        sub: user.id, 
        email: user.email,
        sessionId: session.id,
      }),
      refreshToken: session.refreshToken,
    };
  }

  async googleLogin(profile: any) {
    let user = await this.usersService.findByGoogleId(profile.id);
    
    if (!user) {
      // Check if user exists with this email
      user = await this.usersService.findByEmail(profile.emails[0].value);
      
      if (user) {
        // Link Google account to existing user
        user = await this.usersService.update(user.id, {
          googleId: profile.id,
          avatar: profile.photos[0]?.value,
        });
      } else {
        // Create new user
        user = await this.usersService.create({
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          avatar: profile.photos[0]?.value,
          googleId: profile.id,
          provider: 'google',
          isEmailVerified: true,
        });
      }
    }

    const session = await this.sessionsService.create(user.id);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
      accessToken: this.jwtService.sign({ 
        sub: user.id, 
        email: user.email,
        sessionId: session.id,
      }),
      refreshToken: session.refreshToken,
    };
  }

  async githubLogin(profile: any) {
    let user = await this.usersService.findByGithubId(profile.id);
    
    if (!user) {
      // Check if user exists with this email
      user = await this.usersService.findByEmail(profile.emails[0].value);
      
      if (user) {
        // Link GitHub account to existing user
        user = await this.usersService.update(user.id, {
          githubId: profile.id,
          avatar: profile.photos[0]?.value,
        });
      } else {
        // Create new user
        user = await this.usersService.create({
          email: profile.emails[0].value,
          firstName: profile.displayName.split(' ')[0],
          lastName: profile.displayName.split(' ').slice(1).join(' '),
          avatar: profile.photos[0]?.value,
          githubId: profile.id,
          provider: 'github',
          isEmailVerified: true,
        });
      }
    }

    const session = await this.sessionsService.create(user.id);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
      accessToken: this.jwtService.sign({ 
        sub: user.id, 
        email: user.email,
        sessionId: session.id,
      }),
      refreshToken: session.refreshToken,
    };
  }

  async logout(user: any) {
    await this.sessionsService.revokeSession(user.sessionId);
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    const session = await this.sessionsService.findByToken(refreshToken);
    if (!session || !session.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshedSession = await this.sessionsService.refreshSession(session.sessionToken);
    if (!refreshedSession) {
      throw new UnauthorizedException('Session expired');
    }

    // Get user information
    const user = await this.usersService.findById(session.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      accessToken: this.jwtService.sign({ 
        sub: session.userId, 
        email: user.email,
        sessionId: session.id,
      }),
      refreshToken: refreshedSession.refreshToken,
    };
  }

  async verifyEmail(token: string) {
    // Implement email verification logic
    return { message: 'Email verification not implemented yet' };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await this.usersService.validatePassword(user, password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
