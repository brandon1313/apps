import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export enum PlateType {
  M = 'M',
  P = 'P',
  C = 'C',
}

export enum FineStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'traffic_fines' })
export class TrafficFineEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'plate_type', type: 'enum', enum: PlateType })
  plateType!: PlateType

  @Column({ name: 'plate_number', length: 16 })
  plateNumber!: string

  @Column({ name: 'issued_at', type: 'timestamptz' })
  issuedAt!: Date

  @Column({ length: 220 })
  reason!: string

  @Column({ name: 'evidence_notes', type: 'text', nullable: true })
  evidenceNotes!: string | null

  @Column({ name: 'evidence_photo_url', type: 'text', nullable: true })
  evidencePhotoUrl!: string | null

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount!: string

  @Column({ type: 'enum', enum: FineStatus, default: FineStatus.PENDING })
  status!: FineStatus

  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId!: string | null

  @Column({ name: 'issued_by_agent_id', type: 'uuid', nullable: true })
  issuedByAgentId!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
