import { IsString, IsEnum, IsNumber, IsDateString, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContractDto {
  @ApiProperty()
  @IsString()
  unitId: string;

  @ApiProperty()
  @IsString()
  customerId: string;

  @ApiProperty({ enum: ['monthly', 'daily'] })
  @IsEnum(['monthly', 'daily'])
  rentType: 'monthly' | 'daily';

  @ApiProperty()
  @IsNumber()
  @Min(0)
  baseRentAmount: number;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateContractDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  baseRentAmount?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
