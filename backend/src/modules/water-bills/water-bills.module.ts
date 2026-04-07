import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WaterAccountEntity } from './entities/water-account.entity'
import { WaterBillEntity } from './entities/water-bill.entity'
import { WaterBillsService } from './water-bills.service'
import { WaterBillsController } from './water-bills.controller'
import { PaymentsModule } from '@/modules/payments/payments.module'

@Module({
  imports: [TypeOrmModule.forFeature([WaterAccountEntity, WaterBillEntity]), PaymentsModule],
  providers: [WaterBillsService],
  controllers: [WaterBillsController],
})
export class WaterBillsModule {}
