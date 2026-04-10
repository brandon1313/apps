import { IsObject, IsString, Matches, MaxLength } from 'class-validator'

export class CreateNewsDto {
  @IsString()
  @MaxLength(220)
  slug!: string

  @IsString()
  @MaxLength(220)
  title!: string

  @IsString()
  summary!: string

  @IsString()
  @Matches(/^(https?:\/\/.+|data:image\/.+;base64,.+)/, {
    message: 'coverImageUrl must be a valid URL or a base64 data URL',
  })
  coverImageUrl!: string

  @IsObject()
  content!: Record<string, unknown>
}
