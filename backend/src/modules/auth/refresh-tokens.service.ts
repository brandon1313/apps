import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as argon2 from 'argon2'
import { RefreshTokenEntity } from './entities/refresh-token.entity'

@Injectable()
export class RefreshTokensService {
  private readonly logger = new Logger(RefreshTokensService.name)

  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async issue(userId: string, refreshToken: string, context?: { userAgent?: string; ipAddress?: string }) {
    const tokenHash = await argon2.hash(refreshToken, { type: argon2.argon2id })
    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userAgent: context?.userAgent ?? null,
      ipAddress: context?.ipAddress ?? null,
    })

    const saved = await this.refreshTokenRepository.save(refreshTokenEntity)
    this.logger.log(`Refresh token issued for userId=${userId}`)
    return saved
  }

  async rotate(userId: string, currentToken: string, nextToken: string): Promise<void> {
    const activeTokens = await this.refreshTokenRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    })

    const matchingToken = await this.findMatchingToken(activeTokens, currentToken)

    if (!matchingToken || matchingToken.revokedAt) {
      this.logger.warn(`Refresh token rotation rejected: invalid or revoked token for userId=${userId}`)
      throw new UnauthorizedException('Refresh token is invalid')
    }

    matchingToken.revokedAt = new Date()
    const nextTokenHash = await argon2.hash(nextToken, { type: argon2.argon2id })
    const nextEntity = this.refreshTokenRepository.create({
      userId,
      tokenHash: nextTokenHash,
      expiresAt: matchingToken.expiresAt,
      userAgent: matchingToken.userAgent,
      ipAddress: matchingToken.ipAddress,
    })

    const savedNextEntity = await this.refreshTokenRepository.save(nextEntity)
    matchingToken.replacedByTokenId = savedNextEntity.id
    await this.refreshTokenRepository.save(matchingToken)
    this.logger.log(`Refresh token rotated for userId=${userId}`)
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshTokenEntity)
      .set({ revokedAt: new Date() })
      .where('user_id = :userId AND revoked_at IS NULL', { userId })
      .execute()
    this.logger.log(`All refresh tokens revoked for userId=${userId}`)
  }

  private async findMatchingToken(
    candidates: RefreshTokenEntity[],
    currentToken: string,
  ): Promise<RefreshTokenEntity | null> {
    for (const candidate of candidates) {
      if (await argon2.verify(candidate.tokenHash, currentToken)) {
        return candidate
      }
    }

    return null
  }
}
