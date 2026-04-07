import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { PaymentsService } from '@/modules/payments/payments.service'
import { PaymentType } from '@/modules/payments/entities/payment.entity'
import { SearchWaterBillsDto } from './dto/search-water-bills.dto'
import { WaterAccountEntity } from './entities/water-account.entity'
import { WaterBillEntity, WaterBillStatus } from './entities/water-bill.entity'

@Injectable()
export class WaterBillsService {
  constructor(
    @InjectRepository(WaterAccountEntity)
    private readonly accountsRepository: Repository<WaterAccountEntity>,
    @InjectRepository(WaterBillEntity)
    private readonly billsRepository: Repository<WaterBillEntity>,
    private readonly paymentsService: PaymentsService,
  ) {}

  async search(dto: SearchWaterBillsDto): Promise<WaterBillEntity[]> {
    await this.seedDemoData()

    const queryBuilder = this.accountsRepository.createQueryBuilder('account')

    if (dto.meterNumber) {
      queryBuilder.orWhere('account.meter_number = :meterNumber', {
        meterNumber: dto.meterNumber,
      })
    }

    if (dto.address) {
      queryBuilder.orWhere('account.address ILIKE :address', {
        address: `%${dto.address}%`,
      })
    }

    if (dto.accountHolderName) {
      queryBuilder.orWhere('account.account_holder_name ILIKE :accountHolderName', {
        accountHolderName: `%${dto.accountHolderName}%`,
      })
    }

    const account = await queryBuilder.getOne()

    if (!account) {
      return []
    }

    return this.billsRepository.find({
      where: { waterAccountId: account.id },
      order: { dueDate: 'ASC' },
    })
  }

  async payBill(id: string, userId?: string): Promise<WaterBillEntity> {
    const bill = await this.billsRepository.findOneOrFail({ where: { id } })
    const payment = await this.paymentsService.createPendingPayment({
      type: PaymentType.WATER_BILL,
      amount: Number(bill.amount),
      payerUserId: userId,
      metadata: {
        waterBillId: bill.id,
        waterAccountId: bill.waterAccountId,
      },
    })
    const completedPayment = await this.paymentsService.executeMockPayment(payment)
    bill.status = WaterBillStatus.PAID
    bill.paymentId = completedPayment.id
    return this.billsRepository.save(bill)
  }

  private async seedDemoData(): Promise<void> {
    const accountCount = await this.accountsRepository.count()

    if (accountCount > 0) {
      return
    }

    const account = await this.accountsRepository.save(
      this.accountsRepository.create({
        meterNumber: 'MTR-0001',
        address: 'Zona 1, San Juan Sacatepequez',
        accountHolderName: 'Juan Perez',
      }),
    )

    await this.billsRepository.save([
      this.billsRepository.create({
        waterAccountId: account.id,
        billingPeriod: '2026-02',
        dueDate: '2026-03-25',
        amount: '95.00',
      }),
      this.billsRepository.create({
        waterAccountId: account.id,
        billingPeriod: '2026-01',
        dueDate: '2026-02-25',
        amount: '92.00',
      }),
    ])
  }
}
