import { IsString, IsNumber, IsDate, IsOptional, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @IsMongoId()
  invoiceId: string;

  @IsNumber()
  amount: number;

  @IsDate()
  @Type(() => Date)
  paymentDate: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PaymentResponseDto {
  id: string;
  companyId: string;
  invoiceId: string;
  contractId: string;
  customerId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
