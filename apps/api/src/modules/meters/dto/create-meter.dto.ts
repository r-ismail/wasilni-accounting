import { IsString, IsEnum, IsOptional, IsMongoId, IsBoolean } from 'class-validator';

export class CreateMeterDto {
  @IsMongoId()
  @IsOptional()
  buildingId?: string;

  @IsMongoId()
  @IsOptional()
  unitId?: string;

  @IsString()
  meterNumber: string;

  @IsMongoId()
  serviceId: string;

  @IsEnum(['building', 'unit'])
  type: 'building' | 'unit';

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateMeterDto {
  @IsString()
  @IsOptional()
  meterNumber?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateMeterReadingDto {
  @IsMongoId()
  meterId: string;

  @IsString()
  readingDate: string;

  @IsString()
  currentReading: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
