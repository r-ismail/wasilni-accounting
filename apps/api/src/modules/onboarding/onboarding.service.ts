import { BadRequestException, Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import { BuildingsService } from '../buildings/buildings.service';
import { UnitsService } from '../units/units.service';
import { ServicesService } from '../services/services.service';
import { UsersService } from '../users/users.service';
import { TenantContextService } from '../../tenant/tenant-context.service';
import { QuickSetupDto } from './dto/quick-setup.dto';
import { FurnishingStatus } from '../units/schemas/unit.schema';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly companiesService: CompaniesService,
    private readonly buildingsService: BuildingsService,
    private readonly unitsService: UnitsService,
    private readonly servicesService: ServicesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  /**
   * Quick setup: create company (if needed), set tenant DB, seed optional buildings/services, and admin user.
   */
  async quickSetup(userId: string, dto: QuickSetupDto): Promise<{ companyId: string }> {
    if (!userId) {
      throw new BadRequestException('Missing user context');
    }
    // Super admin only
    const caller = await this.usersService.findById(userId);
    if (!caller || caller.role !== 'super_admin') {
      throw new BadRequestException('Only super admin can run quick setup');
    }

    let companyId = dto.companyId;
    let slug: string | undefined;

    if (companyId) {
      const existing = await this.companiesService.findById(companyId);
      if (!existing) {
        throw new BadRequestException('Company not found');
      }
      slug = existing.slug;
      await this.companiesService.update(companyId, {
        name: dto.company.name,
        phone: dto.company.phone,
        address: dto.company.address,
        taxNumber: dto.company.taxNumber,
        defaultLanguage: dto.company.defaultLanguage,
        mergeServicesWithRent: dto.company.mergeServicesWithRent,
        setupCompleted: true,
        isActive: true,
      });
    } else {
      const created = await this.companiesService.create({
        name: dto.company.name,
        phone: dto.company.phone,
        address: dto.company.address,
        taxNumber: dto.company.taxNumber,
        currency: dto.company.currency,
        defaultLanguage: dto.company.defaultLanguage,
        mergeServicesWithRent: dto.company.mergeServicesWithRent,
        setupCompleted: true,
        isActive: true,
      } as any);
      companyId = created._id.toString();
      slug = created.slug;
    }

    const tenantDb = slug || `company-${companyId}`;
    this.tenantContextService.setOverrideDbName(tenantDb);

    try {
      // Seed buildings/units
      for (const b of dto.buildings || []) {
        const building = await this.buildingsService.create(companyId!, {
          name: b.name,
          address: b.address,
          ...(b.buildingType ? { buildingType: b.buildingType } : {}),
        });

        if (b.furnishedUnits?.count > 0) {
          await this.unitsService.bulkCreate(companyId!, {
            buildingId: building._id.toString(),
            furnishingStatus: FurnishingStatus.FURNISHED,
            count: b.furnishedUnits.count,
            startNumber: b.furnishedUnits.startNumber,
            defaultRentMonthly: b.furnishedUnits.defaultRentMonthly,
            defaultRentDaily: b.furnishedUnits.defaultRentDaily,
          });
        }

        if (b.unfurnishedUnits?.count > 0) {
          await this.unitsService.bulkCreate(companyId!, {
            buildingId: building._id.toString(),
            furnishingStatus: FurnishingStatus.UNFURNISHED,
            count: b.unfurnishedUnits.count,
            startNumber: b.unfurnishedUnits.startNumber,
            defaultRentMonthly: b.unfurnishedUnits.defaultRentMonthly,
            defaultRentDaily: b.unfurnishedUnits.defaultRentDaily,
          });
        }
      }

      // Seed services
      for (const s of dto.services || []) {
        await this.servicesService.create(companyId!, {
          name: s.name,
          type: s.type,
          defaultPrice: s.defaultPrice,
        });
      }

      // Create admin user for this tenant
      await this.usersService.create({
        username: dto.adminUser.username,
        password: dto.adminUser.password,
        role: 'admin' as any,
        companyId,
      });

      // Link caller to the company if desired
      await this.usersService.updateCompany(userId, companyId);

      return { companyId };
    } catch (err) {
      this.logger.error(`Quick setup failed: ${err?.message}`, err?.stack);
      // best-effort rollback new company
      if (dto.companyId == null && companyId) {
        await this.companiesService.deleteById(companyId);
      }
      throw err;
    }
  }
}
