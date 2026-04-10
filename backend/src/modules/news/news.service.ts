import { Injectable, Logger, NotFoundException } from '@nestjs/common'
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
  private readonly logger = new Logger(NewsService.name)

  constructor(
    @InjectRepository(NewsPostEntity)
    private readonly newsRepository: Repository<NewsPostEntity>,
  ) {}

  async create(input: CreateNewsInput): Promise<NewsPostEntity> {
    const entity = this.newsRepository.create({
      ...input,
      status: NewsStatus.DRAFT,
    })

    const saved = await this.newsRepository.save(entity)
    this.logger.log(`News post created: id=${saved.id} slug=${saved.slug} authorId=${input.authorId}`)
    return saved
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
    const previousStatus = post.status
    post.status = status
    post.publishedAt = status === NewsStatus.PUBLISHED ? new Date() : post.publishedAt
    const saved = await this.newsRepository.save(post)
    this.logger.log(`News status changed: id=${id} ${previousStatus} → ${status}`)
    return saved
  }
}
