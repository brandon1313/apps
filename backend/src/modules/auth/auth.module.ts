import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '@/modules/users/users.module'
import { JwtStrategy } from './strategies/jwt.strategy'
import { RefreshTokenEntity } from './entities/refresh-token.entity'
import { RefreshTokensService } from './refresh-tokens.service'

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({}), TypeOrmModule.forFeature([RefreshTokenEntity])],
  providers: [AuthService, JwtStrategy, RefreshTokensService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
