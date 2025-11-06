import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../lib/database/database.service';
import { Login } from '../type/register';
import { JwtPayload, LoginResponse } from '../type/jwt-payload';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  private validateEmail(email: string): void {
    if (!email) {
      throw new BadRequestException('Please enter your email');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }
  }

  private validatePassword(password: string): void {
    if (!password) {
      throw new BadRequestException('Please enter your password');
    }
  }

  async login(loginDto: Login) {
    const { email, password } = loginDto;

    try {
      // Validate input
      this.validateEmail(email);
      this.validatePassword(password);

      // Find user by email
      const users = await this.databaseService.query(
        `SELECT member_id, email, password, first_name, last_name, phone, role, status, created_at 
         FROM member 
         WHERE email = $1`,
        [email.toLowerCase()]
      );

      if (users.length === 0) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const user = users[0];

      // Check if account is active
      if (user.status !== 'active') {
        throw new UnauthorizedException(`Account is ${user.status}. Please contact support.`);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Create JWT payload
      const payload: JwtPayload = {
        sub: user.member_id,
        email: user.email,
        role: user.role,
      };

      // Generate JWT token
      const access_token = this.jwtService.sign(payload);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      const response: LoginResponse = {
        access_token,
        user: userWithoutPassword,
      };

      return response;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Login error:', error);
      throw new BadRequestException('An error occurred during login');
    }
  }
}
