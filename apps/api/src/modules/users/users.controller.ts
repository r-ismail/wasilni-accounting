import { Controller, Get, UseGuards, Request, Post, Body, Put, Param, Delete, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserRole } from '@aqarat/shared';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@Request() req: any) {
    return {
      success: true,
      data: {
        id: req.user.userId,
        username: req.user.username,
        role: req.user.role,
        companyId: req.user.companyId,
      },
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(@Request() req: any) {
    this.ensureAdmin(req.user);
    const users = await this.usersService.findAll(req.user.companyId);
    return { success: true, data: users };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Request() req: any, @Body() dto: CreateUserDto) {
    this.ensureAdmin(req.user);
    const user = await this.usersService.createForCompany(req.user.companyId, dto);
    return { success: true, data: user };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    this.ensureAdmin(req.user);
    const user = await this.usersService.updateUser(req.user.companyId, id, dto);
    return { success: true, data: user };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Request() req: any, @Param('id') id: string) {
    this.ensureAdmin(req.user);
    if (req.user.userId === id) {
      throw new ForbiddenException('Cannot delete your own account');
    }
    await this.usersService.removeUser(req.user.companyId, id);
    return { success: true, message: 'User deleted successfully' };
  }

  private ensureAdmin(user: any) {
    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
