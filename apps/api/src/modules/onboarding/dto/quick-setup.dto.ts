import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@aqarat/shared';
import { BuildingType } from '../../buildings/schemas/building.schema';
import { FurnishingStatus } from '../../units/schemas/unit.schema';
import { ServiceType } from '../../services/schemas/service.schema';

export class CompanyInfoDto {
  @ApiProperty({ description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Company phone' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Company address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Tax number' })
  @IsString()
  @IsOptional()
  taxNumber?: string;

  @ApiProperty({ description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ description: 'Default language', enum: Language })
  @IsEnum(Language)
  defaultLanguage: Language;

  @ApiProperty({ description: 'Merge services with rent invoices', default: true })
  @IsBoolean()
  mergeServicesWithRent: boolean;
}

export class UnitsConfigDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  count: number;

  @ApiProperty({ example: 101 })
  @IsNumber()
  @Min(1)
  startNumber: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  defaultRentMonthly: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultRentDaily?: number;
}

export class BuildingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ enum: BuildingType })
  @IsEnum(BuildingType)
  @IsOptional()
  buildingType?: BuildingType;

  @ApiProperty({ type: UnitsConfigDto })
  @ValidateNested()
  @Type(() => UnitsConfigDto)
  furnishedUnits: UnitsConfigDto;

  @ApiProperty({ type: UnitsConfigDto })
  @ValidateNested()
  @Type(() => UnitsConfigDto)
  unfurnishedUnits: UnitsConfigDto;
}

export class ServiceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ServiceType })
  @IsEnum(ServiceType)
  type: ServiceType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  defaultPrice: number;
}

export class AdminUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class QuickSetupDto {
  @ApiProperty({ type: CompanyInfoDto })
  @ValidateNested()
  @Type(() => CompanyInfoDto)
  company: CompanyInfoDto;

  @ApiPropertyOptional({ description: 'Existing company ID to attach data to' })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ type: [BuildingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BuildingDto)
  @IsOptional()
  buildings?: BuildingDto[];

  @ApiPropertyOptional({ type: [ServiceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceDto)
  @IsOptional()
  services?: ServiceDto[];

  @ApiProperty({ type: AdminUserDto })
  @ValidateNested()
  @Type(() => AdminUserDto)
  adminUser: AdminUserDto;
}
