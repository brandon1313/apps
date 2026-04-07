import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NewsPostEntity, NewsStatus } from './entities/news-post.entity'

type CreateNewsInput = {
  slug: string
  title: string
  summary: string
  coverImageUrl: string
  content: Record<string, unknown>
  authorId: string
}

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsPostEntity)
    private readonly newsRepository: Repository<NewsPostEntity>,
  ) {}

  async create(input: CreateNewsInput): Promise<NewsPostEntity> {
    const entity = this.newsRepository.create({
      ...input,
      status: NewsStatus.DRAFT,
    })

    return this.newsRepository.save(entity)
  }

  async findPublished(): Promise<NewsPostEntity[]> {
    return this.newsRepository.find({
      where: { status: NewsStatus.PUBLISHED },
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
    })
  }

  async findAll(): Promise<NewsPostEntity[]> {
    return this.newsRepository.find({
      order: { createdAt: 'DESC' },
    })
  }

  async findBySlugOrFail(slug: string): Promise<NewsPostEntity> {
    const post = await this.newsRepository.findOne({
      where: {
        slug,
        status: NewsStatus.PUBLISHED,
      },
    })

    if (!post) {
      throw new NotFoundException('News post not found')
    }

    return post
  }

  async findByIdOrFail(id: string): Promise<NewsPostEntity> {
    const post = await this.newsRepository.findOne({ where: { id } })

    if (!post) {
      throw new NotFoundException('News post not found')
    }

    return post
  }

  async updateStatus(id: string, status: NewsStatus): Promise<NewsPostEntity> {
    const post = await this.findByIdOrFail(id)
    post.status = status
    post.publishedAt = status === NewsStatus.PUBLISHED ? new Date() : post.publishedAt
    return this.newsRepository.save(post)
  }
}
