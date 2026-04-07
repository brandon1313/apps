import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PaymentType } from '@/modules/payments/entities/payment.entity'
import { PaymentEntity } from '@/modules/payments/entities/payment.entity'
import { PaymentsService } from '@/modules/payments/payments.service'
import { CreateOrnatoTicketDto } from './dto/create-ornato-ticket.dto'
import { OrnatoTicketEntity, OrnatoTicketStatus } from './entities/ornato-ticket.entity'
import { createOrnatoReceiptDocument, OrnatoReceiptDocument } from './ornato-receipt.util'

export type OrnatoPaymentResult = {
  ticket: OrnatoTicketEntity
  receipt: OrnatoReceiptDocument
}

@Injectable()
export class OrnatoService {
  constructor(
    @InjectRepository(OrnatoTicketEntity)
    private readonly ornatoRepository: Repository<OrnatoTicketEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentsRepository: Repository<PaymentEntity>,
    private readonly paymentsService: PaymentsService,
  ) {}

  async create(dto: CreateOrnatoTicketDto): Promise<OrnatoTicketEntity> {
    const entity = this.ornatoRepository.create({
      name: dto.name,
      dpi: dto.dpi,
      amount: dto.amount.toFixed(2),
    })
    return this.ornatoRepository.save(entity)
  }

  async pay(id: string, userId?: string): Promise<OrnatoPaymentResult> {
    const ticket = await this.findByIdOrFail(id)

    const payment = await this.paymentsService.createPendingPayment({
      type: PaymentType.ORNATO,
      amount: Number(ticket.amount),
      payerName: ticket.name,
      payerDpi: ticket.dpi,
      payerUserId: userId,
      metadata: {
        ornatoTicketId: ticket.id,
      },
    })
    const completedPayment = await this.paymentsService.executeMockPayment(payment)
    ticket.status = OrnatoTicketStatus.PAID
    ticket.paymentId = completedPayment.id
    const savedTicket = await this.ornatoRepository.save(ticket)
    return {
      ticket: savedTicket,
      receipt: createOrnatoReceiptDocument(savedTicket, completedPayment),
    }
  }

  async getReceipt(id: string): Promise<OrnatoReceiptDocument> {
    const ticket = await this.findByIdOrFail(id)

    if (ticket.status !== OrnatoTicketStatus.PAID || !ticket.paymentId) {
      throw new NotFoundException('Ornato receipt not available')
    }

    const payment = await this.paymentsRepository.findOne({ where: { id: ticket.paymentId } })

    if (!payment) {
      throw new NotFoundException('Ornato receipt payment not found')
    }

    return createOrnatoReceiptDocument(ticket, payment)
  }

  private async findByIdOrFail(id: string): Promise<OrnatoTicketEntity> {
    const ticket = await this.ornatoRepository.findOne({ where: { id } })

    if (!ticket) {
      throw new NotFoundException('Ornato ticket not found')
    }

    return ticket
  }
}
