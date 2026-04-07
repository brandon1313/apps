import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { WaterAccountEntity } from './water-account.entity'

export enum WaterBillStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

@Entity({ name: 'water_bills' })
export class WaterBillEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => WaterAccountEntity, (account) => account.bills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'water_account_id' })
  account!: WaterAccountEntity

  @Column({ name: 'water_account_id', type: 'uuid' })
  waterAccountId!: string

  @Column({ name: 'billing_period', length: 32 })
  billingPeriod!: string

  @Column({ name: 'due_date', type: 'date' })
  dueDate!: string

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount!: string

  @Column({ type: 'enum', enum: WaterBillStatus, default: WaterBillStatus.PENDING })
  status!: WaterBillStatus

  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
