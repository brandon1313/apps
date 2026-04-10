import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PaymentType } from '@/modules/payments/entities/payment.entity'
import { PaymentsService } from '@/modules/payments/payments.service'
import { TrafficFineEntity, FineStatus, PlateType } from './entities/traffic-fine.entity'
import { SearchFinesDto } from './dto/search-fines.dto'
import { CreateFineDto } from './dto/create-fine.dto'

@Injectable()
export class FinesService {
  private readonly logger = new Logger(FinesService.name)

  constructor(
    @InjectRepository(TrafficFineEntity)
    private readonly finesRepository: Repository<TrafficFineEntity>,
    private readonly paymentsService: PaymentsService,
  ) {}

  async create(dto: CreateFineDto, agentId?: string): Promise<TrafficFineEntity> {
    const fine = this.finesRepository.create({
      plateType: dto.plateType,
      plateNumber: dto.plateNumber.toUpperCase(),
      reason: dto.reason,
      amount: String(dto.amount),
      evidenceNotes: dto.evidenceNotes ?? null,
      evidencePhotoUrl: dto.evidencePhotoUrl ?? null,
      issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : new Date(),
      status: FineStatus.PENDING,
      issuedByAgentId: agentId ?? null,
    })
    const saved = await this.finesRepository.save(fine)
    this.logger.log(`Fine created: id=${saved.id} plate=${saved.plateType}-${saved.plateNumber} amount=${saved.amount} GTQ`)
    return saved
  }

  async search(dto: SearchFinesDto): Promise<TrafficFineEntity[]> {
    this.logger.log(`Fine search: plateType=${dto.plateType} plateNumber=${dto.plateNumber}`)
    return this.finesRepository.find({
      where: {
        plateType: dto.plateType,
        plateNumber: dto.plateNumber.toUpperCase(),
      },
      order: { issuedAt: 'DESC' },
    })
  }

  async findByIdOrFail(id: string): Promise<TrafficFineEntity> {
    const fine = await this.finesRepository.findOne({ where: { id } })

    if (!fine) {
      throw new NotFoundException('Traffic fine not found')
    }

    return fine
  }

  async payFine(id: string, userId?: string): Promise<TrafficFineEntity> {
    this.logger.log(`Fine payment initiated: fineId=${id} userId=${userId ?? 'anonymous'}`)
    const fine = await this.findByIdOrFail(id)
    const payment = await this.paymentsService.createPendingPayment({
      type: PaymentType.TRAFFIC_FINE,
      amount: Number(fine.amount),
      payerUserId: userId,
      metadata: {
        fineId: fine.id,
        plateType: fine.plateType,
        plateNumber: fine.plateNumber,
      },
    })

    const completedPayment = await this.paymentsService.executeMockPayment(payment)
    fine.status = FineStatus.PAID
    fine.paymentId = completedPayment.id
    const saved = await this.finesRepository.save(fine)
    this.logger.log(`Fine paid: fineId=${id} paymentRef=${completedPayment.reference}`)
    return saved
  }

  async seedDemoData(): Promise<void> {
    const count = await this.finesRepository.count()

    if (count > 0) {
      return
    }

    await this.finesRepository.save([
      this.finesRepository.create({
        plateType: PlateType.P,
        plateNumber: '556FQS',
        issuedAt: new Date(),
        reason: 'Estacionamiento indebido',
        evidenceNotes: 'Capturado por agente municipal',
        evidencePhotoUrl:
          'https://munisanjuansac.org/msj/wp-content/uploads/2025/12/IMG_4540-scaled.jpg',
        amount: '250.00',
      }),
    ])
  }
}
