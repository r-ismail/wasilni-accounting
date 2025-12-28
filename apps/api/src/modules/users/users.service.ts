import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { UserRole } from '@aqarat/shared';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(userData: {
    username: string;
    password: string;
    role: UserRole;
    companyId?: string;
    isActive?: boolean;
  }): Promise<UserDocument> {
    const { username, password, role, companyId, isActive } = userData;
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      username,
      password: hashedPassword,
      role,
      companyId: companyId || null,
      isActive: isActive ?? true,
    });

    return user.save();
  }

  async createForCompany(companyId: string, dto: CreateUserDto): Promise<UserDocument> {
    const user = await this.create({
      username: dto.username,
      password: dto.password,
      role: dto.role,
      companyId,
      isActive: dto.isActive,
    });
    const sanitized = await this.userModel
      .findById(user._id)
      .select('-password -refreshToken')
      .exec();
    if (!sanitized) {
      throw new NotFoundException('User not found');
    }
    return sanitized;
  }

  async findAll(companyId: string): Promise<UserDocument[]> {
    return this.userModel
      .find({ companyId })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateUser(companyId: string, id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findOne({ _id: id, companyId }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.username && dto.username !== user.username) {
      const existing = await this.userModel.findOne({ username: dto.username }).exec();
      if (existing) {
        throw new ConflictException('Username already exists');
      }
      user.username = dto.username;
    }

    if (dto.password) {
      if (dto.password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters');
      }
      user.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.role) {
      user.role = dto.role;
    }

    if (dto.isActive !== undefined) {
      user.isActive = dto.isActive;
    }

    await user.save();
    const sanitized = await this.userModel
      .findById(user._id)
      .select('-password -refreshToken')
      .exec();
    if (!sanitized) {
      throw new NotFoundException('User not found');
    }
    return sanitized;
  }

  async removeUser(companyId: string, id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id, companyId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username, isActive: true });
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findById(id).exec();
    } catch (error) {
      return null;
    }
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken });
  }

  async updateCompany(userId: string, companyId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { companyId });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { password: hashedPassword });
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async seedSuperAdmin(): Promise<void> {
    const superAdminExists = await this.userModel.findOne({
      role: UserRole.SUPER_ADMIN,
    });

    if (!superAdminExists) {
      await this.create({
        username: 'admin',
        password: 'admin123',
        role: UserRole.SUPER_ADMIN,
      });
      console.log('Super admin created: username=admin, password=admin123');
    }
  }
}
