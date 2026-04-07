import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NewsPostEntity } from './entities/news-post.entity'
import { NewsService } from './news.service'
import { NewsController } from './news.controller'

@Module({
  imports: [TypeOrmModule.forFeature([NewsPostEntity])],
  providers: [NewsService],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}
