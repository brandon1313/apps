import { IsOptional, IsString, MaxLength } from 'class-validator'

export class SearchWaterBillsDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  meterNumber?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string

  @IsOptional()
  @IsString()
  @MaxLength(180)
  accountHolderName?: string
}
