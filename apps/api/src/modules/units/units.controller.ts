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
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto } from './dto/create-unit.dto';
import { BulkCreateUnitsDto } from './dto/bulk-create-units.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('units')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new unit' })
  async create(@Request() req: any, @Body() createUnitDto: CreateUnitDto) {
    const unit = await this.unitsService.create(
      req.user.companyId,
      createUnitDto,
    );
    return { success: true, data: unit };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple units at once' })
  async bulkCreate(@Request() req: any, @Body() bulkCreateDto: BulkCreateUnitsDto) {
    const units = await this.unitsService.bulkCreate(
      req.user.companyId,
      bulkCreateDto,
    );
    return { success: true, data: units };
  }

  @Get()
  @ApiOperation({ summary: 'Get all units with optional filters' })
  @ApiQuery({ name: 'buildingId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'furnishingStatus', required: false })
  async findAll(
    @Request() req: any,
    @Query('buildingId') buildingId?: string,
    @Query('status') status?: string,
    @Query('furnishingStatus') furnishingStatus?: string,
  ) {
    const units = await this.unitsService.findAll(req.user.companyId, {
      buildingId,
      status,
      furnishingStatus,
    });
    return { success: true, data: units };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a unit by ID' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const unit = await this.unitsService.findOne(req.user.companyId, id);
    return { success: true, data: unit };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a unit' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    const unit = await this.unitsService.update(
      req.user.companyId,
      id,
      updateUnitDto,
    );
    return { success: true, data: unit };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a unit' })
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.unitsService.remove(req.user.companyId, id);
    return { success: true, message: 'Unit deleted successfully' };
  }
}
