import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { randomUUID } from 'crypto'
import type { StringValue } from 'ms'
import { UsersService } from '@/modules/users/users.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { AccessTokenPayload } from './strategies/jwt.strategy'
import { Role } from '@/common/enums/role.enum'
import { RefreshTokensService } from './refresh-tokens.service'

type AuthTokens = {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokensService: RefreshTokensService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existingUser = await this.usersService.findByEmail(dto.email)

    if (existingUser) {
      throw new ConflictException('Email already registered')
    }

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id })
    const user = await this.usersService.create({
      fullName: dto.fullName,
      dpi: dto.dpi,
      email: dto.email,
      phoneNumber: dto.phoneNumber ?? null,
      passwordHash,
      role: Role.USER,
    })

    return this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    })
  }

  private static readonly MAX_FAILED_ATTEMPTS = 5
  private static readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(dto.email)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new HttpException('Account temporarily locked due to too many failed attempts', HttpStatus.TOO_MANY_REQUESTS)
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password)

    if (!isValid) {
      await this.usersService.incrementFailedLogins(
        user.id,
        AuthService.MAX_FAILED_ATTEMPTS,
        AuthService.LOCKOUT_DURATION_MS,
      )
      throw new UnauthorizedException('Invalid credentials')
    }

    await this.usersService.resetFailedLogins(user.id)
    await this.usersService.updateLastLogin(user.id)

    return this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    })
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.jwtService.verifyAsync<AccessTokenPayload & { tokenId: string }>(refreshToken, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    })
    const nextTokens = await this.issueTokens({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    })
    await this.refreshTokensService.rotate(payload.sub, refreshToken, nextTokens.refreshToken)
    return nextTokens
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokensService.revokeAllForUser(userId)
  }

  private async issueTokens(payload: AccessTokenPayload): Promise<AuthTokens> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_TTL') as StringValue,
    })

    const refreshToken = await this.jwtService.signAsync(
      {
        ...payload,
        tokenId: randomUUID(),
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: `${this.configService.getOrThrow<number>('JWT_REFRESH_TTL_DAYS')}d`,
      },
    )

    await this.refreshTokensService.issue(payload.sub, refreshToken)

    return {
      accessToken,
      refreshToken,
    }
  }
}
