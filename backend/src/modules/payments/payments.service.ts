import { Injectable, Logger } from '@nestjs/common'
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
  private readonly logger = new Logger(PaymentsService.name)

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

    const saved = await this.paymentRepository.save(payment)
    this.logger.log(`Payment created: ref=${saved.reference} type=${saved.type} amount=${saved.amount} GTQ`)
    return saved
  }

  async executeMockPayment(payment: PaymentEntity): Promise<PaymentEntity> {
    this.logger.log(`Payment processing: ref=${payment.reference} amount=${payment.amount} GTQ`)
    const result = await this.paymentProcessorService.processMockPayment({
      amount: Number(payment.amount),
      currency: payment.currency,
      reference: payment.reference,
    })

    payment.status = PaymentStatus.SUCCEEDED
    payment.externalTransactionId = result.externalTransactionId
    payment.processedAt = result.processedAt

    const saved = await this.paymentRepository.save(payment)
    this.logger.log(`Payment succeeded: ref=${saved.reference} externalId=${saved.externalTransactionId}`)
    return saved
  }
}
