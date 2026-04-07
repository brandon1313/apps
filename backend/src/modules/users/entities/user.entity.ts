import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Role } from '@/common/enums/role.enum'
import { RefreshTokenEntity } from '@/modules/auth/entities/refresh-token.entity'
import { NewsPostEntity } from '@/modules/news/entities/news-post.entity'
import { PaymentEntity } from '@/modules/payments/entities/payment.entity'

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'full_name', length: 180 })
  fullName!: string

  @Column({ length: 32, unique: true })
  dpi!: string

  @Column({ length: 180, unique: true })
  email!: string

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string

  @Column({ name: 'phone_number', type: 'varchar', length: 32, nullable: true })
  phoneNumber!: string | null

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role!: Role

  @Column({ name: 'is_active', default: true })
  isActive!: boolean

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts!: number

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil!: Date | null

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.user)
  refreshTokens!: RefreshTokenEntity[]

  @OneToMany(() => NewsPostEntity, (newsPost) => newsPost.author)
  newsPosts!: NewsPostEntity[]

  @OneToMany(() => PaymentEntity, (payment) => payment.payerUser)
  payments!: PaymentEntity[]
}
