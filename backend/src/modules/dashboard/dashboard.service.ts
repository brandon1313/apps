import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MoreThanOrEqual, Repository } from 'typeorm'
import { Role } from '@/common/enums/role.enum'
import { AccessTokenPayload } from '@/modules/auth/strategies/jwt.strategy'
import { UserEntity } from '@/modules/users/entities/user.entity'
import { NewsPostEntity, NewsStatus } from '@/modules/news/entities/news-post.entity'
import { PaymentEntity, PaymentStatus } from '@/modules/payments/entities/payment.entity'
import { TrafficFineEntity, FineStatus } from '@/modules/fines/entities/traffic-fine.entity'
import { WaterBillEntity, WaterBillStatus } from '@/modules/water-bills/entities/water-bill.entity'
import { OrnatoTicketEntity, OrnatoTicketStatus } from '@/modules/ornato/entities/ornato-ticket.entity'

export type DashboardSummary = {
  publishedNewsCount: number
  successfulPaymentsTodayCount: number
  activeUsersCount: number
  pendingPaymentsCount: number
  recentActivity: DashboardActivity[]
}

type DashboardActivity = {
  id: string
  type: 'PAYMENT' | 'NEWS' | 'USER'
  title: string
  description: string
  timestamp: string
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(NewsPostEntity)
    private readonly newsRepository: Repository<NewsPostEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentsRepository: Repository<PaymentEntity>,
    @InjectRepository(TrafficFineEntity)
    private readonly finesRepository: Repository<TrafficFineEntity>,
    @InjectRepository(WaterBillEntity)
    private readonly waterBillsRepository: Repository<WaterBillEntity>,
    @InjectRepository(OrnatoTicketEntity)
    private readonly ornatoRepository: Repository<OrnatoTicketEntity>,
  ) {}

  async getSummary(user: AccessTokenPayload): Promise<DashboardSummary> {
    if (user.role === Role.ADMIN) {
      return this.getAdminSummary()
    }

    return this.getPersonalSummary(user)
  }

  private async getAdminSummary(): Promise<DashboardSummary> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [
      publishedNewsCount,
      successfulPaymentsTodayCount,
      activeUsersCount,
      pendingFinesCount,
      pendingWaterBillsCount,
      pendingOrnatoCount,
      recentPayments,
      recentNews,
      recentUsers,
    ] = await Promise.all([
      this.newsRepository.count({
        where: { status: NewsStatus.PUBLISHED },
      }),
      this.paymentsRepository.count({
        where: {
          status: PaymentStatus.SUCCEEDED,
          processedAt: MoreThanOrEqual(startOfDay),
        },
      }),
      this.usersRepository.count({
        where: { isActive: true },
      }),
      this.finesRepository.count({
        where: { status: FineStatus.PENDING },
      }),
      this.waterBillsRepository.count({
        where: { status: WaterBillStatus.PENDING },
      }),
      this.ornatoRepository.count({
        where: { status: OrnatoTicketStatus.PENDING },
      }),
      this.paymentsRepository.find({
        take: 4,
        order: { createdAt: 'DESC' },
      }),
      this.newsRepository.find({
        take: 4,
        order: { updatedAt: 'DESC' },
      }),
      this.usersRepository.find({
        take: 3,
        order: { createdAt: 'DESC' },
      }),
    ])

    const pendingPaymentsCount = pendingFinesCount + pendingWaterBillsCount + pendingOrnatoCount
    const recentActivity = [
      ...recentPayments.map<DashboardActivity>((payment) => ({
        id: `payment-${payment.id}`,
        type: 'PAYMENT',
        title: `Pago ${payment.reference}`,
        description: `${payment.type} • ${payment.status} • GTQ ${payment.amount}`,
        timestamp: (payment.processedAt ?? payment.createdAt).toISOString(),
      })),
      ...recentNews.map<DashboardActivity>((news) => ({
        id: `news-${news.id}`,
        type: 'NEWS',
        title: news.title,
        description: `Estado ${news.status} • ${news.slug}`,
        timestamp: news.updatedAt.toISOString(),
      })),
      ...recentUsers.map<DashboardActivity>((user) => ({
        id: `user-${user.id}`,
        type: 'USER',
        title: user.fullName,
        description: `${user.role} • ${user.email}`,
        timestamp: (user.lastLoginAt ?? user.createdAt).toISOString(),
      })),
    ]
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
      .slice(0, 6)

    return {
      publishedNewsCount,
      successfulPaymentsTodayCount,
      activeUsersCount,
      pendingPaymentsCount,
      recentActivity,
    }
  }

  private async getPersonalSummary(user: AccessTokenPayload): Promise<DashboardSummary> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [publishedNewsCount, successfulPaymentsTodayCount, pendingPaymentsCount, recentPayments, recentNews] =
      await Promise.all([
        this.newsRepository.count({
          where: { status: NewsStatus.PUBLISHED },
        }),
        this.paymentsRepository.count({
          where: {
            payerUserId: user.sub,
            status: PaymentStatus.SUCCEEDED,
            processedAt: MoreThanOrEqual(startOfDay),
          },
        }),
        this.paymentsRepository.count({
          where: {
            payerUserId: user.sub,
            status: PaymentStatus.PENDING,
          },
        }),
        this.paymentsRepository.find({
          where: { payerUserId: user.sub },
          take: 6,
          order: { createdAt: 'DESC' },
        }),
        user.role === Role.WRITER
          ? this.newsRepository.find({
              where: { authorId: user.sub },
              take: 4,
              order: { updatedAt: 'DESC' },
            })
          : Promise.resolve([]),
      ])

    const recentActivity = [
      ...recentPayments.map<DashboardActivity>((payment) => ({
        id: `payment-${payment.id}`,
        type: 'PAYMENT',
        title: `Pago ${payment.reference}`,
        description: `${payment.type} • ${payment.status} • GTQ ${payment.amount}`,
        timestamp: (payment.processedAt ?? payment.createdAt).toISOString(),
      })),
      ...recentNews.map<DashboardActivity>((news) => ({
        id: `news-${news.id}`,
        type: 'NEWS',
        title: news.title,
        description: `Estado ${news.status} • ${news.slug}`,
        timestamp: news.updatedAt.toISOString(),
      })),
    ]
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
      .slice(0, 6)

    return {
      publishedNewsCount,
      successfulPaymentsTodayCount,
      activeUsersCount: 0,
      pendingPaymentsCount,
      recentActivity,
    }
  }
}
