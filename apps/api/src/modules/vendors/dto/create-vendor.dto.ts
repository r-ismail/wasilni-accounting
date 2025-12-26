import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVendorDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    contactName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    taxNumber?: string;

    @IsNotEmpty()
    @IsString()
    category: string;
}

export class UpdateVendorDto extends CreateVendorDto {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
