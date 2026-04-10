import { Injectable, Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'

export type MockPaymentRequest = {
  amount: number
  currency: string
  reference: string
}

export type MockPaymentResult = {
  status: 'SUCCEEDED'
  externalTransactionId: string
  processedAt: Date
}

@Injectable()
export class PaymentProcessorService {
  private readonly logger = new Logger(PaymentProcessorService.name)

  async processMockPayment(request: MockPaymentRequest): Promise<MockPaymentResult> {
    this.logger.log(`[MOCK] Processing payment: ref=${request.reference} amount=${request.amount} ${request.currency}`)
    const result: MockPaymentResult = {
      status: 'SUCCEEDED',
      externalTransactionId: `mock_${request.reference}_${randomUUID()}`,
      processedAt: new Date(),
    }
    this.logger.log(`[MOCK] Payment processed: externalId=${result.externalTransactionId}`)
    return result
  }
}
