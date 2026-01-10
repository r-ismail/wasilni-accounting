import { Injectable, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import { CompaniesService } from '../companies/companies.service';
import { BuildingsService } from '../buildings/buildings.service';
import { UnitsService } from '../units/units.service';
import { ServicesService } from '../services/services.service';
import { UsersService } from '../users/users.service';
import { RunSetupDto } from './dto/run-setup.dto';
import { FurnishingStatus } from '../units/schemas/unit.schema';
import { TenantContextService } from '../../tenant/tenant-context.service';

@Injectable()
export class SetupService {
  private readonly logger = new Logger(SetupService.name);

  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    private companiesService: CompaniesService,
    private buildingsService: BuildingsService,
    private unitsService: UnitsService,
    private servicesService: ServicesService,
    private usersService: UsersService,
    private tenantContextService: TenantContextService,
  ) { }

  async getSetupStatus(userId: string): Promise<{ setupCompleted: boolean; companyId?: string }> {
    this.logger?.debug?.(`getSetupStatus for user ${userId}`);
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
    this.logger?.log?.(`runSetup invoked by user ${userId} for companyId ${setupDto.companyId || 'new'}`);
    // Verify user is super admin
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role !== 'super_admin') {
      throw new BadRequestException('Only super admin can run initial setup');
    }

    let companyId: string;
    let companyDoc: CompanyDocument | null = null;

    if (setupDto.companyId) {
      companyDoc = await this.companyModel.findById(setupDto.companyId).exec();
      if (!companyDoc) {
        throw new BadRequestException('Company not found');
      }
      await this.companyModel.findByIdAndUpdate(setupDto.companyId, {
        name: setupDto.company.name,
        taxNumber: setupDto.company.taxNumber,
        phone: setupDto.company.phone,
        address: setupDto.company.address,
        currency: setupDto.company.currency,
        defaultLanguage: setupDto.company.defaultLanguage,
        mergeServicesWithRent: setupDto.company.mergeServicesWithRent,
        setupCompleted: true,
        isActive: true,
      });
      companyId = setupDto.companyId;
    } else {
      const slugBase = this.slugify(setupDto.company.name);
      const slug = slugBase || `company-${Date.now()}`;
      companyDoc = new this.companyModel({
        name: setupDto.company.name,
        slug,
        phone: setupDto.company.phone,
        address: setupDto.company.address,
        taxNumber: setupDto.company.taxNumber,
        currency: setupDto.company.currency,
        defaultLanguage: setupDto.company.defaultLanguage,
        mergeServicesWithRent: setupDto.company.mergeServicesWithRent,
        setupCompleted: true,
        isActive: true,
      });
      await companyDoc.save();
      companyId = companyDoc._id.toString();
    }

    const tenantDbName =
      companyDoc?.slug || this.slugify(companyDoc?.name || '') || `company-${companyId}`;
    this.tenantContextService.setOverrideDbName(tenantDbName);

    try {
      // Create buildings and units
      for (const buildingDto of setupDto.buildings) {
        const building = await this.buildingsService.create(companyId, {
          name: buildingDto.name,
          address: buildingDto.address,
          ...(buildingDto.buildingType ? { buildingType: buildingDto.buildingType } : {}),
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
          name: serviceDto.name,
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
      this.logger?.error?.(`runSetup failed for company ${companyId}: ${error?.message}`, error?.stack);
      // Rollback: delete company if setup fails
      await this.companyModel.deleteOne({ _id: companyDoc?._id }).exec();
      throw error;
    }
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
