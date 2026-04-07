import { IsEnum } from 'class-validator'
import { NewsStatus } from '../entities/news-post.entity'

export class UpdateNewsStatusDto {
  @IsEnum(NewsStatus)
  status!: NewsStatus
}
