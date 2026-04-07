import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TrafficFineEntity } from './entities/traffic-fine.entity'
import { FinesService } from './fines.service'
import { FinesController } from './fines.controller'
import { PaymentsModule } from '@/modules/payments/payments.module'

@Module({
  imports: [TypeOrmModule.forFeature([TrafficFineEntity]), PaymentsModule],
  providers: [FinesService],
  controllers: [FinesController],
})
export class FinesModule {}
