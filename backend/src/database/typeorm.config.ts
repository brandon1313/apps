import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { DataSource, DataSourceOptions } from 'typeorm'
import { UserEntity } from '@/modules/users/entities/user.entity'
import { RefreshTokenEntity } from '@/modules/auth/entities/refresh-token.entity'
import { NewsPostEntity } from '@/modules/news/entities/news-post.entity'
import { PaymentEntity } from '@/modules/payments/entities/payment.entity'
import { TrafficFineEntity } from '@/modules/fines/entities/traffic-fine.entity'
import { WaterAccountEntity } from '@/modules/water-bills/entities/water-account.entity'
import { WaterBillEntity } from '@/modules/water-bills/entities/water-bill.entity'
import { OrnatoTicketEntity } from '@/modules/ornato/entities/ornato-ticket.entity'

export function typeOrmOptionsFactory(configService: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: configService.getOrThrow<string>('DATABASE_HOST'),
    port: configService.getOrThrow<number>('DATABASE_PORT'),
    database: configService.getOrThrow<string>('DATABASE_NAME'),
    username: configService.getOrThrow<string>('DATABASE_USER'),
    password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
    entities: [
      UserEntity,
      RefreshTokenEntity,
      NewsPostEntity,
      PaymentEntity,
      TrafficFineEntity,
      WaterAccountEntity,
      WaterBillEntity,
      OrnatoTicketEntity,
    ],
    migrations: ['dist/database/migrations/*.js'],
    synchronize: false,
    logging: false,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: [
    UserEntity,
    RefreshTokenEntity,
    NewsPostEntity,
    PaymentEntity,
    TrafficFineEntity,
    WaterAccountEntity,
    WaterBillEntity,
    OrnatoTicketEntity,
  ],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}

export default new DataSource(dataSourceOptions)
