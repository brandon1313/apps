import { IsObject, IsString, IsUrl, MaxLength } from 'class-validator'

export class CreateNewsDto {
  @IsString()
  @MaxLength(220)
  slug!: string

  @IsString()
  @MaxLength(220)
  title!: string

  @IsString()
  summary!: string

  @IsUrl()
  coverImageUrl!: string

  @IsObject()
  content!: Record<string, unknown>
}
