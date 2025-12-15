import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  async create(@Request() req: any, @Body() createServiceDto: CreateServiceDto) {
    const service = await this.servicesService.create(
      req.user.companyId,
      createServiceDto,
    );
    return { success: true, data: service };
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async findAll(
    @Request() req: any,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const services = await this.servicesService.findAll(
      req.user.companyId,
      activeOnly === 'true',
    );
    return { success: true, data: services };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by ID' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const service = await this.servicesService.findOne(req.user.companyId, id);
    return { success: true, data: service };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    const service = await this.servicesService.update(
      req.user.companyId,
      id,
      updateServiceDto,
    );
    return { success: true, data: service };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service' })
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.servicesService.remove(req.user.companyId, id);
    return { success: true, message: 'Service deleted successfully' };
  }
}
