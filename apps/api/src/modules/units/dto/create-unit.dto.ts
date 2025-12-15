import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FurnishingStatus, UsageType } from '../schemas/unit.schema';

export class CreateUnitDto {
  @ApiProperty({ description: 'Building ID' })
  @IsMongoId()
  @IsNotEmpty()
  buildingId: string;

  @ApiProperty({ description: 'Unit number', example: '101' })
  @IsString()
  @IsNotEmpty()
  unitNumber: string;

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

export class UpdateUnitDto {
  @ApiPropertyOptional({ description: 'Unit number', example: '101' })
  @IsString()
  @IsOptional()
  unitNumber?: string;

  @ApiPropertyOptional({
    description: 'Furnishing status',
    enum: FurnishingStatus,
  })
  @IsEnum(FurnishingStatus)
  @IsOptional()
  furnishingStatus?: FurnishingStatus;

  @ApiPropertyOptional({
    description: 'Usage type',
    enum: UsageType,
  })
  @IsEnum(UsageType)
  @IsOptional()
  usageType?: UsageType;

  @ApiPropertyOptional({ description: 'Default monthly rent' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultRentMonthly?: number;

  @ApiPropertyOptional({ description: 'Default daily rent' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultRentDaily?: number;

  @ApiPropertyOptional({
    description: 'Unit status',
    enum: ['available', 'occupied', 'maintenance'],
  })
  @IsEnum(['available', 'occupied', 'maintenance'])
  @IsOptional()
  status?: 'available' | 'occupied' | 'maintenance';
}
