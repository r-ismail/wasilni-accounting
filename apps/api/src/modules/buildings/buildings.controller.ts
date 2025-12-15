import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('buildings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new building' })
  async create(@Request() req: any, @Body() createBuildingDto: CreateBuildingDto) {
    const building = await this.buildingsService.create(
      req.user.companyId,
      createBuildingDto,
    );
    return { success: true, data: building };
  }

  @Get()
  @ApiOperation({ summary: 'Get all buildings' })
  async findAll(@Request() req: any) {
    const buildings = await this.buildingsService.findAll(req.user.companyId);
    return { success: true, data: buildings };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a building by ID' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const building = await this.buildingsService.findOne(
      req.user.companyId,
      id,
    );
    return { success: true, data: building };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a building' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateBuildingDto: Partial<CreateBuildingDto>,
  ) {
    const building = await this.buildingsService.update(
      req.user.companyId,
      id,
      updateBuildingDto,
    );
    return { success: true, data: building };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a building' })
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.buildingsService.remove(req.user.companyId, id);
    return { success: true, message: 'Building deleted successfully' };
  }
}
