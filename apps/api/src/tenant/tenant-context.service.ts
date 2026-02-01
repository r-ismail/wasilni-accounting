import { Inject, Injectable, Scope, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CompaniesService } from '../modules/companies/companies.service';

interface TenantRequest {
  user?: { companyId?: string; role?: string; username?: string };
  method?: string;
  url?: string;
}

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private overrideDbName?: string;
  private resolvedDbName?: string;
  private readonly logger = new Logger(TenantContextService.name);

  constructor(
    @Inject(REQUEST) private readonly request: TenantRequest,
    private readonly companiesService: CompaniesService,
  ) { }

  private getControlDbName(): string {
    // Try explicit control DB name first
    if (process.env.CONTROL_DB_NAME) {
      return this.sanitizeDbName(process.env.CONTROL_DB_NAME);
    }

    // Otherwise parse the DB name from the control URI
    const uri =
      process.env.CONTROL_MONGODB_URI ||
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/aqarat-accounting';

    const match = uri.match(/\/([^/?]+)(?:\?|$)/);
    const parsed = match?.[1];
    if (parsed) {
      return this.sanitizeDbName(parsed);
    }

    // Safe default
    return this.sanitizeDbName(
      process.env.TENANT_FALLBACK_DB ||
      process.env.MONGODB_FALLBACK_DB ||
      'aqarat-accounting',
    );
  }

  setOverrideDbName(dbName: string) {
    this.overrideDbName = dbName;
  }

  async getTenantDbName(): Promise<string> {
    if (this.overrideDbName) {
      return this.overrideDbName;
    }
    if (this.resolvedDbName) {
      return this.resolvedDbName;
    }

    const role = this.request?.user?.role;
    const companyId = this.request?.user?.companyId;
    const requestInfo = `${this.request?.method || 'UNKNOWN'} ${this.request?.url || ''}`.trim();

    // Super admin should always stay on control DB
    if (role === 'super_admin' || role === 'superadmin') {
      const controlDb = this.getControlDbName();
      this.resolvedDbName = controlDb;
      return this.resolvedDbName;
    }

    if (!companyId) {
      const controlDb = this.getControlDbName();
      // Only warn if not a super admin (already handled above, but just in case of different spelling/format)
      if (role !== 'super_admin' && role !== 'superadmin') {
        this.logger.warn(
          `Company context is missing (role: ${role || 'none'}, req: ${requestInfo}); using control/fallback DB "${controlDb}".`,
        );
      }
      this.resolvedDbName = controlDb;
      return this.resolvedDbName;
    }

    if (!this.companiesService || !this.companiesService.findById) {
      // In non-request contexts (e.g., schedulers) or if injection failed, fall back safely
      const controlDb = this.getControlDbName();
      this.logger.error(
        'CompaniesService is unavailable or not initialized in tenant context; using control DB instead.',
      );
      this.resolvedDbName = controlDb;
      return this.resolvedDbName;
    }

    let company = null;
    try {
      company = await this.companiesService.findById(companyId);
    } catch (err) {
      // If the provided companyId is not a valid ObjectId, try by slug
      this.logger.warn(`Invalid companyId format "${companyId}", trying slug lookup. req: ${requestInfo}`);
      try {
        company = await this.companiesService.findBySlug(companyId);
      } catch (innerErr) {
        this.logger.error(`Slug lookup failed for "${companyId}" (req: ${requestInfo}): ${innerErr?.message}`);
      }
    }
    if (!company) {
      const controlDb = this.getControlDbName();
      this.logger.warn(
        `Company "${companyId}" not found (req: ${requestInfo}); falling back to control DB "${controlDb}".`,
      );
      this.resolvedDbName = controlDb;
      return this.resolvedDbName;
    }

    const slugBase = company.slug || this.slugify(company.name) || `company-${company._id.toString()}`;
    this.resolvedDbName = this.sanitizeDbName(slugBase);
    return this.resolvedDbName;
  }

  private sanitizeDbName(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
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
