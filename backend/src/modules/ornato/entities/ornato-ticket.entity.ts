import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export enum OrnatoTicketStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

@Entity({ name: 'ornato_tickets' })
export class OrnatoTicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 180 })
  name!: string

  @Column({ length: 32 })
  dpi!: string

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount!: string

  @Column({ type: 'enum', enum: OrnatoTicketStatus, default: OrnatoTicketStatus.PENDING })
  status!: OrnatoTicketStatus

  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
