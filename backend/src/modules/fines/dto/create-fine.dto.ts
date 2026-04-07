import { IsEnum, IsISO8601, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator'
import { PlateType } from '../entities/traffic-fine.entity'

export class CreateFineDto {
  @IsEnum(PlateType)
  plateType!: PlateType

  @IsString()
  @MaxLength(16)
  plateNumber!: string

  @IsString()
  @MaxLength(220)
  reason!: string

  @IsNumber()
  @IsPositive()
  amount!: number

  @IsOptional()
  @IsString()
  evidenceNotes?: string

  @IsOptional()
  @IsString()
  evidencePhotoUrl?: string

  @IsOptional()
  @IsISO8601()
  issuedAt?: string
}
