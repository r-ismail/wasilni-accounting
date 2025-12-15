import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvoicesService } from './invoices.service';
import { GenerateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto } from './dto/generate-invoice.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new invoice' })
  async generate(@Request() req: any, @Body() dto: GenerateInvoiceDto) {
    const invoice = await this.invoicesService.generateInvoice(
      req.user.companyId,
      dto,
    );
    return {
      success: true,
      data: invoice,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  async findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('contractId') contractId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const invoices = await this.invoicesService.findAll(req.user.companyId, {
      status,
      contractId,
      fromDate,
      toDate,
    });
    return {
      success: true,
      data: invoices,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async findOne(@Param('id') id: string) {
    const invoice = await this.invoicesService.findOne(id);
    return {
      success: true,
      data: invoice,
    };
  }

  @Get(':id/lines')
  @ApiOperation({ summary: 'Get invoice lines' })
  async getLines(@Param('id') id: string) {
    const lines = await this.invoicesService.getInvoiceLines(id);
    return {
      success: true,
      data: lines,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    const invoice = await this.invoicesService.updateStatus(id, dto);
    return {
      success: true,
      data: invoice,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice' })
  async update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    const invoice = await this.invoicesService.update(id, dto);
    return {
      success: true,
      data: invoice,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  async delete(@Param('id') id: string) {
    await this.invoicesService.delete(id);
    return {
      success: true,
      message: 'Invoice deleted successfully',
    };
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate invoice PDF' })
  async generatePdf(@Param('id') id: string, @Request() res: any) {
    const pdfBuffer = await this.invoicesService.generatePdf(id);
    return pdfBuffer;
  }
}
