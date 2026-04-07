import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from '@/modules/users/entities/user.entity'

export enum NewsStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

@Entity({ name: 'news_posts' })
export class NewsPostEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 220, unique: true })
  slug!: string

  @Column({ length: 220 })
  title!: string

  @Column({ type: 'text' })
  summary!: string

  @Column({ name: 'cover_image_url', type: 'text' })
  coverImageUrl!: string

  @Column({ type: 'jsonb' })
  content!: Record<string, unknown>

  @Column({ type: 'enum', enum: NewsStatus, default: NewsStatus.DRAFT })
  status!: NewsStatus

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null

  @ManyToOne(() => UserEntity, (user) => user.newsPosts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'author_id' })
  author!: UserEntity

  @Column({ name: 'author_id', type: 'uuid' })
  authorId!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
