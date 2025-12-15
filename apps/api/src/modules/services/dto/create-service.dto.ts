import { IsString, IsEnum, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '../schemas/service.schema';

export class CreateServiceDto {
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
