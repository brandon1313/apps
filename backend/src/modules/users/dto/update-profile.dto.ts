import { IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  fullName?: string

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phoneNumber?: string
}
