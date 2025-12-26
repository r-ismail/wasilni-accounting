import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/create-vendor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorsController {
    constructor(private readonly vendorsService: VendorsService) { }

    @Post()
    create(@Request() req: any, @Body() createVendorDto: CreateVendorDto) {
        return this.vendorsService.create(req.user.companyId, createVendorDto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.vendorsService.findAll(req.user.companyId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.vendorsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
        return this.vendorsService.update(id, updateVendorDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.vendorsService.remove(id);
    }
}
