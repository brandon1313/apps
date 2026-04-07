import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { randomUUID } from 'crypto'
import { PaymentEntity, PaymentStatus, PaymentType } from './entities/payment.entity'
import { PaymentProcessorService } from './payment-processor.service'

type CreatePaymentInput = {
  type: PaymentType
  amount: number
  payerName?: string
  payerDpi?: string
  payerUserId?: string
  metadata: Record<string, unknown>
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    private readonly paymentProcessorService: PaymentProcessorService,
  ) {}

  async createPendingPayment(input: CreatePaymentInput): Promise<PaymentEntity> {
    const payment = this.paymentRepository.create({
      reference: `MUNI-${randomUUID().slice(0, 12).toUpperCase()}`,
      type: input.type,
      amount: input.amount.toFixed(2),
      currency: 'GTQ',
      status: PaymentStatus.PENDING,
      payerName: input.payerName ?? null,
      payerDpi: input.payerDpi ?? null,
      payerUserId: input.payerUserId ?? null,
      metadata: input.metadata,
    })

    return this.paymentRepository.save(payment)
  }

  async executeMockPayment(payment: PaymentEntity): Promise<PaymentEntity> {
    const result = await this.paymentProcessorService.processMockPayment({
      amount: Number(payment.amount),
      currency: payment.currency,
      reference: payment.reference,
    })

    payment.status = PaymentStatus.SUCCEEDED
    payment.externalTransactionId = result.externalTransactionId
    payment.processedAt = result.processedAt

    return this.paymentRepository.save(payment)
  }
}
