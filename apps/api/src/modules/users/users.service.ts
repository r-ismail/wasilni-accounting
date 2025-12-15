import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { UserRole } from '@aqarat/shared';

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
  }): Promise<UserDocument> {
    const { username, password, role, companyId } = userData;
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
    });

    return user.save();
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
