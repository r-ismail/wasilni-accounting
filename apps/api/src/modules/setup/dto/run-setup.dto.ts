import {
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@aqarat/shared';
import { FurnishingStatus, UsageType } from '../../units/schemas/unit.schema';
import { ServiceType } from '../../services/schemas/service.schema';

// Company Info DTO
export class CompanyInfoDto {
  @ApiProperty({ description: 'Company name', example: 'My Property Management' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Currency code', example: 'SAR' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'Default language',
    enum: Language,
    example: Language.AR,
  })
  @IsEnum(Language)
  @IsNotEmpty()
  defaultLanguage: Language;

  @ApiProperty({
    description: 'Merge services with rent invoices',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  mergeServicesWithRent: boolean;
}

// Units Config DTO
export class UnitsConfigDto {
  @ApiProperty({ description: 'Number of units', example: 10 })
  @IsNumber()
  @Min(0)
  count: number;

  @ApiProperty({ description: 'Starting unit number', example: 101 })
  @IsNumber()
  @Min(1)
  startNumber: number;

  @ApiProperty({ description: 'Default monthly rent', example: 5000 })
  @IsNumber()
  @Min(0)
  defaultRentMonthly: number;

  @ApiPropertyOptional({ description: 'Default daily rent', example: 200 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultRentDaily?: number;
}

// Building DTO
export class BuildingSetupDto {
  @ApiProperty({ description: 'Building name', example: 'Building A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Building address', example: '123 Main St' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Furnished units configuration' })
  @ValidateNested()
  @Type(() => UnitsConfigDto)
  furnishedUnits: UnitsConfigDto;

  @ApiProperty({ description: 'Unfurnished units configuration' })
  @ValidateNested()
  @Type(() => UnitsConfigDto)
  unfurnishedUnits: UnitsConfigDto;
}

// Service DTO
export class ServiceSetupDto {
  @ApiProperty({ description: 'Service name', example: 'Water' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Service type',
    enum: ServiceType,
    example: ServiceType.METERED,
  })
  @IsEnum(ServiceType)
  @IsNotEmpty()
  type: ServiceType;

  @ApiProperty({ description: 'Default price', example: 0.5 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  defaultPrice: number;
}

// Admin User DTO
export class AdminUserDto {
  @ApiProperty({ description: 'Admin username', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: 'Admin password', example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

// Main Setup DTO
export class RunSetupDto {
  @ApiProperty({ description: 'Company information' })
  @ValidateNested()
  @Type(() => CompanyInfoDto)
  @IsNotEmpty()
  company: CompanyInfoDto;

  @ApiProperty({ description: 'Buildings and units configuration', type: [BuildingSetupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BuildingSetupDto)
  @IsNotEmpty()
  buildings: BuildingSetupDto[];

  @ApiProperty({ description: 'Default services', type: [ServiceSetupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceSetupDto)
  @IsNotEmpty()
  services: ServiceSetupDto[];

  @ApiProperty({ description: 'Admin user credentials' })
  @ValidateNested()
  @Type(() => AdminUserDto)
  @IsNotEmpty()
  adminUser: AdminUserDto;
}
