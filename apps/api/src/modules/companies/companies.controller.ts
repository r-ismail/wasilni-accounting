import { Controller, Get, Patch, UseGuards, Request, Body } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('my-company')
  async getMyCompany(@Request() req: any) {
    return this.companiesService.findById(req.user.companyId);
  }

  @Patch('my-company/logo')
  async updateLogo(@Request() req: any, @Body('logo') logo: string) {
    return this.companiesService.updateLogo(req.user.companyId, logo);
  }
}
