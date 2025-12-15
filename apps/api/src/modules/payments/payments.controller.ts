import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Record a new payment' })
  async create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: any) {
    const payment = await this.paymentsService.create(
      createPaymentDto,
      req.user.companyId,
      req.user.userId,
    );
    return {
      success: true,
      data: payment,
      message: 'Payment recorded successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  async findAll(@Req() req: any, @Query() query: any) {
    const payments = await this.paymentsService.findAll(
      req.user.companyId,
      query,
    );
    return {
      success: true,
      data: payments,
    };
  }

  @Get('invoice/:invoiceId')
  @ApiOperation({ summary: 'Get payments for an invoice' })
  async getByInvoice(@Param('invoiceId') invoiceId: string, @Req() req: any) {
    const payments = await this.paymentsService.getPaymentsByInvoice(
      invoiceId,
      req.user.companyId,
    );
    return {
      success: true,
      data: payments,
    };
  }

  @Get('contract/:contractId')
  @ApiOperation({ summary: 'Get payments for a contract' })
  async getByContract(
    @Param('contractId') contractId: string,
    @Req() req: any,
  ) {
    const payments = await this.paymentsService.getPaymentsByContract(
      contractId,
      req.user.companyId,
    );
    return {
      success: true,
      data: payments,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const payment = await this.paymentsService.findOne(id, req.user.companyId);
    return {
      success: true,
      data: payment,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.paymentsService.delete(id, req.user.companyId);
    return {
      success: true,
      message: 'Payment deleted successfully',
    };
  }
}
