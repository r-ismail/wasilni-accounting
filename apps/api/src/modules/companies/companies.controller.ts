import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantContextService } from '../../tenant/tenant-context.service';
import { CreateCompanyDto } from '@aqarat/shared';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly tenantContext: TenantContextService,
  ) {}

  // ---------- Tenant scope (admin/user) ----------
  @Get('my-company')
  async getMyCompany(@Request() req: any) {
    const company = await this.companiesService.findById(req.user.companyId);
    const dbName = await this.tenantContext.getTenantDbName();
    return { success: true, data: { ...company?.toObject?.(), dbName } };
  }

  @Patch('my-company')
  async updateMyCompany(@Request() req: any, @Body() updateData: any) {
    return this.companiesService.update(req.user.companyId, updateData);
  }

  @Patch('my-company/logo')
  async updateLogo(@Request() req: any, @Body('logo') logo: string) {
    return this.companiesService.updateLogo(req.user.companyId, logo);
  }

  // ---------- Control (super admin) ----------
  @Get()
  async listAll(@Request() req: any) {
    this.ensureSuperAdmin(req);
    const companies = await this.companiesService.findAll();
    return { success: true, data: companies };
  }

  @Post()
  async createCompany(@Request() req: any, @Body() dto: CreateCompanyDto) {
    this.ensureSuperAdmin(req);
    const company = await this.companiesService.create(dto);
    return { success: true, data: company };
  }

  @Get(':id')
  async getCompanyById(@Request() req: any, @Param('id') id: string) {
    this.ensureSuperAdmin(req);
    const company = await this.companiesService.findById(id);
    return { success: true, data: company };
  }

  @Patch(':id')
  async updateCompany(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    this.ensureSuperAdmin(req);
    const updated = await this.companiesService.update(id, body);
    return { success: true, data: updated };
  }

  @Delete(':id')
  async deleteCompany(@Request() req: any, @Param('id') id: string) {
    this.ensureSuperAdmin(req);
    await this.companiesService.deleteById(id);
    return { success: true, message: 'Company deleted' };
  }

  private ensureSuperAdmin(req: any) {
    if (req.user?.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can perform this action');
    }
  }
}
