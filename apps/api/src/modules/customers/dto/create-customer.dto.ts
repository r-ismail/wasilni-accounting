import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ enum: ['individual', 'company'] })
  @IsEnum(['individual', 'company'])
  type: 'individual' | 'company';

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  idNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  taxNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCustomerDto {
  @ApiProperty({ enum: ['individual', 'company'], required: false })
  @IsEnum(['individual', 'company'])
  @IsOptional()
  type?: 'individual' | 'company';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  idNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  taxNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
