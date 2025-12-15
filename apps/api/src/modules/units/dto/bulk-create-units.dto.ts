import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FurnishingStatus, UsageType } from '../schemas/unit.schema';

export class BulkCreateUnitsDto {
  @ApiProperty({ description: 'Building ID' })
  @IsMongoId()
  @IsNotEmpty()
  buildingId: string;

  @ApiProperty({
    description: 'Furnishing status',
    enum: FurnishingStatus,
    example: FurnishingStatus.FURNISHED,
  })
  @IsEnum(FurnishingStatus)
  @IsNotEmpty()
  furnishingStatus: FurnishingStatus;

  @ApiPropertyOptional({
    description: 'Usage type',
    enum: UsageType,
    example: UsageType.APARTMENT,
  })
  @IsEnum(UsageType)
  @IsOptional()
  usageType?: UsageType;

  @ApiProperty({ description: 'Number of units to create', example: 10 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  count: number;

  @ApiProperty({ description: 'Starting unit number', example: 101 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  startNumber: number;

  @ApiProperty({ description: 'Default monthly rent', example: 5000 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  defaultRentMonthly: number;

  @ApiPropertyOptional({ description: 'Default daily rent', example: 200 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultRentDaily?: number;
}
