import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { MetersService } from './meters.service';
import { CreateMeterDto, UpdateMeterDto, CreateMeterReadingDto, UpdateMeterReadingDto } from './dto/create-meter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('meters')
@UseGuards(JwtAuthGuard)
export class MetersController {
  constructor(private readonly metersService: MetersService) {}

  @Post()
  create(@Req() req: any, @Body() createMeterDto: CreateMeterDto) {
    return this.metersService.create(req.user.companyId, createMeterDto);
  }

  @Get()
  findAll(@Req() req: any, @Query('type') type?: string) {
    return this.metersService.findAll(req.user.companyId, type);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.metersService.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() updateMeterDto: UpdateMeterDto) {
    return this.metersService.update(req.user.companyId, id, updateMeterDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.metersService.remove(req.user.companyId, id);
  }

  // Readings
  @Post('readings')
  createReading(@Req() req: any, @Body() createReadingDto: CreateMeterReadingDto) {
    return this.metersService.createReading(req.user.companyId, createReadingDto);
  }

  @Get('readings/list')
  findReadings(@Req() req: any, @Query('meterId') meterId?: string) {
    return this.metersService.findReadings(req.user.companyId, meterId);
  }

  @Patch('readings/:id')
  updateReading(@Req() req: any, @Param('id') id: string, @Body() updateReadingDto: UpdateMeterReadingDto) {
    return this.metersService.updateReading(req.user.companyId, id, updateReadingDto);
  }

  @Delete('readings/:id')
  removeReading(@Req() req: any, @Param('id') id: string) {
    return this.metersService.removeReading(req.user.companyId, id);
  }

  @Post('distribute/:buildingId')
  distribute(@Req() req: any, @Param('buildingId') buildingId: string, @Body('readingDate') readingDate: string) {
    return this.metersService.distributeBuildingMeterConsumption(
      req.user.companyId,
      buildingId,
      new Date(readingDate),
    );
  }
}
