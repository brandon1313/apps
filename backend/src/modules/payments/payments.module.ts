import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PaymentEntity } from './entities/payment.entity'
import { PaymentsService } from './payments.service'
import { PaymentProcessorService } from './payment-processor.service'

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])],
  providers: [PaymentsService, PaymentProcessorService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
