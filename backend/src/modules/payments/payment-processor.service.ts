import { Injectable } from '@nestjs/common'
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
  async processMockPayment(request: MockPaymentRequest): Promise<MockPaymentResult> {
    return {
      status: 'SUCCEEDED',
      externalTransactionId: `mock_${request.reference}_${randomUUID()}`,
      processedAt: new Date(),
    }
  }
}
