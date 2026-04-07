import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { UserEntity } from '@/modules/users/entities/user.entity'
import { NewsPostEntity } from '@/modules/news/entities/news-post.entity'
import { PaymentEntity } from '@/modules/payments/entities/payment.entity'
import { TrafficFineEntity } from '@/modules/fines/entities/traffic-fine.entity'
import { WaterBillEntity } from '@/modules/water-bills/entities/water-bill.entity'
import { OrnatoTicketEntity } from '@/modules/ornato/entities/ornato-ticket.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      NewsPostEntity,
      PaymentEntity,
      TrafficFineEntity,
      WaterBillEntity,
      OrnatoTicketEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
