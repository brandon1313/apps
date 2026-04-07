import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { HealthModule } from './modules/health/health.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { NewsModule } from './modules/news/news.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { FinesModule } from './modules/fines/fines.module'
import { WaterBillsModule } from './modules/water-bills/water-bills.module'
import { OrnatoModule } from './modules/ornato/ornato.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { validateEnv } from './config/env.schema'
import { typeOrmOptionsFactory } from './database/typeorm.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        { name: 'default', ttl: 60_000, limit: 100 },
        {
          name: 'auth',
          ttl: config.get<number>('AUTH_THROTTLE_TTL')!,
          limit: config.get<number>('AUTH_THROTTLE_LIMIT')!,
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmOptionsFactory,
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    NewsModule,
    PaymentsModule,
    DashboardModule,
    FinesModule,
    WaterBillsModule,
    OrnatoModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
