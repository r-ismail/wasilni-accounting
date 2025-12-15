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
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractDto } from './dto/create-contract.dto';

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contract' })
  async create(@Request() req: any, @Body() createContractDto: CreateContractDto) {
    const contract = await this.contractsService.create(
      req.user.companyId,
      createContractDto,
    );
    return { success: true, data: contract };
  }

  @Get()
  @ApiOperation({ summary: 'Get all contracts' })
  async findAll(
    @Request() req: any,
    @Query('unitId') unitId?: string,
    @Query('customerId') customerId?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const contracts = await this.contractsService.findAll(req.user.companyId, {
      unitId,
      customerId,
      activeOnly: activeOnly === 'true',
    });
    return { success: true, data: contracts };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract by ID' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const contract = await this.contractsService.findOne(req.user.companyId, id);
    return { success: true, data: contract };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contract' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    const contract = await this.contractsService.update(
      req.user.companyId,
      id,
      updateContractDto,
    );
    return { success: true, data: contract };
  }

  @Patch(':id/terminate')
  @ApiOperation({ summary: 'Terminate contract' })
  async terminate(@Request() req: any, @Param('id') id: string) {
    const contract = await this.contractsService.terminate(req.user.companyId, id);
    return { success: true, data: contract, message: 'Contract terminated successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contract' })
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.contractsService.remove(req.user.companyId, id);
    return { success: true, message: 'Contract deleted successfully' };
  }
}
