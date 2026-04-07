import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { WaterBillEntity } from './water-bill.entity'

@Entity({ name: 'water_accounts' })
export class WaterAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'meter_number', length: 64, unique: true })
  meterNumber!: string

  @Column({ length: 255 })
  address!: string

  @Column({ name: 'account_holder_name', length: 180 })
  accountHolderName!: string

  @OneToMany(() => WaterBillEntity, (waterBill) => waterBill.account)
  bills!: WaterBillEntity[]

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
