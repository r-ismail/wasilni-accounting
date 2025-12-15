import { IsNotEmpty, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateInvoiceDto {
  @ApiProperty({ description: 'Contract ID' })
  @IsNotEmpty()
  @IsString()
  contractId: string;

  @ApiProperty({ description: 'Period start date', example: '2024-01-01' })
  @IsNotEmpty()
  @IsDateString()
  periodStart: string;

  @ApiProperty({ description: 'Period end date', example: '2024-01-31' })
  @IsNotEmpty()
  @IsDateString()
  periodEnd: string;

  @ApiProperty({ description: 'Optional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInvoiceDto {
  @ApiProperty({ description: 'Period start date', required: false })
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @ApiProperty({ description: 'Period end date', required: false })
  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @ApiProperty({ description: 'Due date', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInvoiceStatusDto {
  @ApiProperty({
    description: 'Invoice status',
    enum: ['draft', 'posted', 'paid', 'cancelled'],
  })
  @IsNotEmpty()
  @IsString()
  status: 'draft' | 'posted' | 'paid' | 'cancelled';
}
