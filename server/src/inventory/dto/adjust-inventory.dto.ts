import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AdjustInventoryDto {
  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(-100000)
  @Max(100000)
  quantity!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
