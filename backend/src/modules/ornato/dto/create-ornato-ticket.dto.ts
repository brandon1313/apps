import { IsNumber, IsString, MaxLength, Min } from 'class-validator'

export class CreateOrnatoTicketDto {
  @IsString()
  @MaxLength(180)
  name!: string

  @IsString()
  @MaxLength(32)
  dpi!: string

  @IsNumber()
  @Min(1)
  amount!: number
}
