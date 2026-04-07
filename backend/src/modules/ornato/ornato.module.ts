import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrnatoTicketEntity } from './entities/ornato-ticket.entity'
import { PaymentsModule } from '@/modules/payments/payments.module'
import { OrnatoService } from './ornato.service'
import { OrnatoController } from './ornato.controller'
import { PaymentEntity } from '@/modules/payments/entities/payment.entity'

@Module({
  imports: [TypeOrmModule.forFeature([OrnatoTicketEntity, PaymentEntity]), PaymentsModule],
  providers: [OrnatoService],
  controllers: [OrnatoController],
})
export class OrnatoModule {}
