import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../lib/database/database.service';
import { Register } from '../type/register';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private databaseService: DatabaseService) {}

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
      throw new BadRequestException("Please enter your password");
    }
    if (password.length < 6) {
      throw new BadRequestException("Password must be at least 6 characters long");
    }
  }

  private validateName(name: string, field: string): void {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException(`Please enter your ${field}`);
    }
  }

  private validatePhone(phone: string): void {
    if (phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        throw new BadRequestException('Phone number is invalid (must be 10 digits)');
      }
    }
  }

  async register(registerDto: Register) {
    const { email, password, first_name, last_name, phone } = registerDto;

    try {
      this.validateEmail(email);
      this.validatePassword(password);
      this.validateName(first_name, "First Name");
      this.validateName(last_name, "Last Name");
      if (phone) {
        this.validatePhone(phone);
      }

      const existingUser = await this.databaseService.query(
        'SELECT email FROM member WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.length > 0) {
        throw new ConflictException("This email is already registered");
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const result = await this.databaseService.query(
        `INSERT INTO member (email, password, first_name, last_name, phone, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING member_id, email, first_name, last_name, phone, role, status, created_at`,
        [
          email.toLowerCase(),
          hashedPassword,
          first_name.trim(),
          last_name.trim(),
          phone || null,
          'member',
          'active'
        ]
      );

      const user = result[0];

      return {
        success: true,
        message: 'Registration successful',
        user: {
          member_id: user.member_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
        },
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Register error:', error);
      throw new BadRequestException('An error occurred during registration');
    }
  }
}
