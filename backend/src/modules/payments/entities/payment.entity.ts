import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from '@/modules/users/entities/user.entity'

export enum PaymentType {
  TRAFFIC_FINE = 'TRAFFIC_FINE',
  WATER_BILL = 'WATER_BILL',
  ORNATO = 'ORNATO',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'payments' })
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 64, unique: true })
  reference!: string

  @Column({ type: 'enum', enum: PaymentType })
  type!: PaymentType

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount!: string

  @Column({ length: 8, default: 'GTQ' })
  currency!: string

  @ManyToOne(() => UserEntity, (user) => user.payments, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payer_user_id' })
  payerUser!: UserEntity | null

  @Column({ name: 'payer_user_id', type: 'uuid', nullable: true })
  payerUserId!: string | null

  @Column({ name: 'payer_name', type: 'varchar', length: 180, nullable: true })
  payerName!: string | null

  @Column({ name: 'payer_dpi', type: 'varchar', length: 32, nullable: true })
  payerDpi!: string | null

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>

  @Column({ name: 'external_transaction_id', type: 'varchar', length: 128, nullable: true })
  externalTransactionId!: string | null

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
