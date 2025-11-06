import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt';
import { RolesGuard } from '../../auth/guards/roles';
import { Roles } from '../../auth/decorators/roles';

@Controller('api/profile')
export class ProfileController {
  // Protected route - requires authentication
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Request() req) {
    return {
      success: true,
      message: 'Profile retrieved successfully',
      user: req.user,
    };
  }

  // Protected route - requires authentication
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@Request() req) {
    return {
      success: true,
      data: {
        member_id: req.user.member_id,
        email: req.user.email,
        role: req.user.role,
      },
    };
  }

  // Admin only route
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  getAdminData(@Request() req) {
    return {
      success: true,
      message: 'Admin data',
      user: req.user,
    };
  }
}
