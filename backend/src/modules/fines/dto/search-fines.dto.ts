import { IsEnum, IsString, MaxLength } from 'class-validator'
import { PlateType } from '../entities/traffic-fine.entity'

export class SearchFinesDto {
  @IsEnum(PlateType)
  plateType!: PlateType

  @IsString()
  @MaxLength(16)
  plateNumber!: string
}
