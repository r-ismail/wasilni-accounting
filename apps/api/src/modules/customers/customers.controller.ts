import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  async create(@Request() req: any, @Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customersService.create(
      req.user.companyId,
      createCustomerDto,
    );
    return { success: true, data: customer };
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  async findAll(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const customers = await this.customersService.findAll(req.user.companyId, {
      search,
      type,
      activeOnly: activeOnly === 'true',
    });
    return { success: true, data: customers };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const customer = await this.customersService.findOne(req.user.companyId, id);
    return { success: true, data: customer };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const customer = await this.customersService.update(
      req.user.companyId,
      id,
      updateCustomerDto,
    );
    return { success: true, data: customer };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.customersService.remove(req.user.companyId, id);
    return { success: true, message: 'Customer deleted successfully' };
  }
}
