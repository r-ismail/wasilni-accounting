import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  async revenue(@Request() req: any, @Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
    const data = await this.reportsService.getRevenueReport(req.user.companyId, { fromDate, toDate });
    return { success: true, data };
  }

  @Get('occupancy')
  @ApiOperation({ summary: 'Get occupancy report' })
  async occupancy(@Request() req: any) {
    const data = await this.reportsService.getOccupancyReport(req.user.companyId);
    return { success: true, data };
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue report' })
  async overdue(@Request() req: any) {
    const data = await this.reportsService.getOverdueReport(req.user.companyId);
    return { success: true, data };
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get customer level report' })
  async customers(@Request() req: any) {
    const data = await this.reportsService.getCustomersReport(req.user.companyId);
    return { success: true, data };
  }

  @Get('units')
  @ApiOperation({ summary: 'Get unit level report' })
  async units(@Request() req: any) {
    const data = await this.reportsService.getUnitsReport(req.user.companyId);
    return { success: true, data };
  }
}
