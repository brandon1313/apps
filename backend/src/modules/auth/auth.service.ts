import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
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
  private readonly logger = new Logger(AuthService.name)

  private static maskEmail(email: string): string {
    const [local, domain] = email.split('@')
    return `${local[0]}***@${domain}`
  }

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokensService: RefreshTokensService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existingUser = await this.usersService.findByEmail(dto.email)

    if (existingUser) {
      this.logger.warn(`Registration failed: email already registered [${AuthService.maskEmail(dto.email)}]`)
      throw new ConflictException('Email already registered')
    }

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id })

    let user: Awaited<ReturnType<typeof this.usersService.create>>
    try {
      user = await this.usersService.create({
        fullName: dto.fullName,
        dpi: dto.dpi,
        email: dto.email,
        phoneNumber: dto.phoneNumber ?? null,
        passwordHash,
        role: Role.USER,
      })
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: unknown }).code === '23505'
      ) {
        const detail = 'detail' in err ? String((err as { detail: unknown }).detail) : ''
        if (detail.includes('(dpi)')) {
          this.logger.warn(`Registration failed: DPI already registered [${AuthService.maskEmail(dto.email)}]`)
          throw new ConflictException('DPI already registered')
        }
      }
      throw err
    }

    this.logger.log(`User registered: ${AuthService.maskEmail(dto.email)}`)
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
      this.logger.warn(`Login failed: user not found [${AuthService.maskEmail(dto.email)}]`)
      throw new UnauthorizedException('Invalid credentials')
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      this.logger.warn(`Login blocked: account locked [${AuthService.maskEmail(dto.email)}]`)
      throw new HttpException('Account temporarily locked due to too many failed attempts', HttpStatus.TOO_MANY_REQUESTS)
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password)

    if (!isValid) {
      this.logger.warn(`Login failed: invalid password [${AuthService.maskEmail(dto.email)}] attempts=${user.failedLoginAttempts + 1}`)
      await this.usersService.incrementFailedLogins(
        user.id,
        AuthService.MAX_FAILED_ATTEMPTS,
        AuthService.LOCKOUT_DURATION_MS,
      )
      throw new UnauthorizedException('Invalid credentials')
    }

    await this.usersService.resetFailedLogins(user.id)
    await this.usersService.updateLastLogin(user.id)

    this.logger.log(`Login success: [${AuthService.maskEmail(dto.email)}] userId=${user.id}`)
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
    this.logger.log(`Token refreshed for userId=${payload.sub}`)
    return nextTokens
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokensService.revokeAllForUser(userId)
    this.logger.log(`User logged out, tokens revoked: userId=${userId}`)
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
