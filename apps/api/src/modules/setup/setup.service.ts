import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company } from '../companies/schemas/company.schema';
import { CompaniesService } from '../companies/companies.service';
import { BuildingsService } from '../buildings/buildings.service';
import { UnitsService } from '../units/units.service';
import { ServicesService } from '../services/services.service';
import { UsersService } from '../users/users.service';
import { RunSetupDto } from './dto/run-setup.dto';
import { FurnishingStatus } from '../units/schemas/unit.schema';

@Injectable()
export class SetupService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @Inject(forwardRef(() => CompaniesService))
    private companiesService: CompaniesService,
    private buildingsService: BuildingsService,
    private unitsService: UnitsService,
    private servicesService: ServicesService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async getSetupStatus(userId: string): Promise<{ setupCompleted: boolean; companyId?: string }> {
    // Check if user is super admin (no company)
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }
    
    if (user.role === 'super_admin' && !user.companyId) {
      return { setupCompleted: false };
    }

    // Check if company setup is completed
    if (user.companyId) {
      const company = await this.companyModel.findById(user.companyId).exec();
      return {
        setupCompleted: company?.setupCompleted || false,
        companyId: user.companyId.toString(),
      };
    }

    return { setupCompleted: false };
  }

  async runSetup(userId: string, setupDto: RunSetupDto): Promise<{ companyId: string }> {
    // Verify user is super admin
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }
    
    if (user.role !== 'super_admin') {
      throw new BadRequestException('Only super admin can run initial setup');
    }

    if (user.companyId) {
      throw new BadRequestException('Setup already completed for this user');
    }

    // Create company
    const company = new this.companyModel({
      name: setupDto.company.name,
      currency: setupDto.company.currency,
      defaultLanguage: setupDto.company.defaultLanguage,
      mergeServicesWithRent: setupDto.company.mergeServicesWithRent,
      setupCompleted: true,
      isActive: true,
    });
    await company.save();

    const companyId = company._id.toString();

    try {
      // Create buildings and units
      for (const buildingDto of setupDto.buildings) {
        const building = await this.buildingsService.create(companyId, {
          name: buildingDto.name,
          address: buildingDto.address,
        });

        // Create furnished units
        if (buildingDto.furnishedUnits.count > 0) {
          await this.unitsService.bulkCreate(companyId, {
            buildingId: building._id.toString(),
            furnishingStatus: FurnishingStatus.FURNISHED,
            count: buildingDto.furnishedUnits.count,
            startNumber: buildingDto.furnishedUnits.startNumber,
            defaultRentMonthly: buildingDto.furnishedUnits.defaultRentMonthly,
            defaultRentDaily: buildingDto.furnishedUnits.defaultRentDaily,
          });
        }

        // Create unfurnished units
        if (buildingDto.unfurnishedUnits.count > 0) {
          await this.unitsService.bulkCreate(companyId, {
            buildingId: building._id.toString(),
            furnishingStatus: FurnishingStatus.UNFURNISHED,
            count: buildingDto.unfurnishedUnits.count,
            startNumber: buildingDto.unfurnishedUnits.startNumber,
            defaultRentMonthly: buildingDto.unfurnishedUnits.defaultRentMonthly,
            defaultRentDaily: buildingDto.unfurnishedUnits.defaultRentDaily,
          });
        }
      }

      // Create services
      for (const serviceDto of setupDto.services) {
        await this.servicesService.create(companyId, {
          nameAr: serviceDto.name,
          nameEn: serviceDto.name,
          type: serviceDto.type,
          defaultPrice: serviceDto.defaultPrice,
        });
      }

      // Create admin user
      await this.usersService.create({
        username: setupDto.adminUser.username,
        password: setupDto.adminUser.password,
        role: 'admin' as any,
        companyId,
      });

      // Update super admin user with company
      await this.usersService.updateCompany(userId, companyId);

      return { companyId };
    } catch (error) {
      // Rollback: delete company if setup fails
      await this.companyModel.deleteOne({ _id: company._id }).exec();
      throw error;
    }
  }
}
