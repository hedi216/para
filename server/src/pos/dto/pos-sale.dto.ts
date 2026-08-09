import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class PosSaleItemDto {
  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreatePosSaleDto {
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  registerId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PosSaleItemDto)
  items!: PosSaleItemDto[];

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  customerId?: string;
}

export class PosRefundItemDto {
  @IsString()
  posSaleItemId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class RefundPosSaleDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PosRefundItemDto)
  items?: PosRefundItemDto[];

  @IsOptional()
  @IsString()
  reason?: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}

export class PosStockAdjustDto {
  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(-100000)
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  reason!: string;
}

export class CreatePosInvoiceDto {
  @IsString()
  posSaleId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  customerAddress!: string;

  @IsOptional()
  @IsString()
  taxIdentifier?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
