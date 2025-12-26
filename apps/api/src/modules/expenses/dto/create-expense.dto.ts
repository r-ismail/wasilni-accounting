import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateExpenseDto {
    @IsNotEmpty()
    @IsDateString()
    date: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    category: string;

    @IsOptional()
    @IsMongoId()
    vendorId?: string;

    @IsOptional()
    @IsMongoId()
    buildingId?: string;

    @IsOptional()
    @IsMongoId()
    unitId?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    paymentMethod?: string;

    @IsOptional()
    @IsString()
    referenceNumber?: string;

    @IsOptional()
    @IsString()
    invoiceNumber?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachments?: string[];
}

export class UpdateExpenseDto extends CreateExpenseDto { }
