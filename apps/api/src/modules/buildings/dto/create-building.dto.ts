import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BuildingType } from '../schemas/building.schema';

export class CreateBuildingDto {
  @ApiProperty({ description: 'Building name', example: 'Building A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Building address', example: '123 Main St' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Building type',
    enum: BuildingType,
    example: BuildingType.APARTMENT,
  })
  @IsEnum(BuildingType)
  @IsOptional()
  buildingType?: BuildingType;
}
