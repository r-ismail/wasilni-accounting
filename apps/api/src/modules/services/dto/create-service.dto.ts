import { IsString, IsEnum, IsNumber, IsNotEmpty, Min, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '../schemas/service.schema';

export class CreateServiceDto {
  @ApiProperty({ description: 'Service name', example: 'Maintenance' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Service description', example: 'Monthly maintenance service' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Service type',
    enum: ServiceType,
    example: ServiceType.FIXED_FEE,
  })
  @IsEnum(ServiceType)
  @IsNotEmpty()
  type: ServiceType;

  @ApiProperty({ description: 'Default price', example: 100 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  defaultPrice: number;

  @ApiPropertyOptional({ description: 'Unit of measurement', example: 'month' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: 'Service category', example: 'utilities' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Tax rate (%)', example: 0 })
  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Is service active', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Requires approval', example: false })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ description: 'Is service taxable', example: false })
  @IsBoolean()
  @IsOptional()
  taxable?: boolean;

  @ApiPropertyOptional({ description: 'Minimum charge', example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minCharge?: number;

  @ApiPropertyOptional({ description: 'Maximum charge (0 = no limit)', example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxCharge?: number;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}
