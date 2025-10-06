import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateToken(token: string): Promise<any> {
    try {
      // Verify JWT token locally first
      const decoded = this.jwtService.verify(token);
      
      // Validate with app-auth service
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://app-auth:3001';
      const response = await axios.get(`${authServiceUrl}/api/v1/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 5000, // 5 second timeout
      });

      if (response.status === 200) {
        return response.data;
      }
      
      throw new UnauthorizedException('Invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      
      // If auth service is down, fall back to local JWT verification
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.warn('Auth service unavailable, using local JWT verification');
        try {
          const decoded = this.jwtService.verify(token);
          return { id: decoded.sub, email: decoded.email };
        } catch (jwtError) {
          throw new UnauthorizedException('Invalid token');
        }
      }
      
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
