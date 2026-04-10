import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from './entities/user.entity'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    const entity = this.usersRepository.create(user)
    const saved = await this.usersRepository.save(entity)
    this.logger.log(`User created: id=${saved.id}`)
    return saved
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email } })
  }

  async findByIdOrFail(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() })
    this.logger.log(`Last login updated for userId=${id}`)
  }

  async incrementFailedLogins(id: string, maxAttempts: number, lockDurationMs: number): Promise<void> {
    await this.usersRepository.increment({ id }, 'failedLoginAttempts', 1)
    const user = await this.findByIdOrFail(id)
    this.logger.warn(`Failed login attempt recorded for userId=${id} attempts=${user.failedLoginAttempts}`)
    if (user.failedLoginAttempts >= maxAttempts) {
      const lockedUntil = new Date(Date.now() + lockDurationMs)
      await this.usersRepository.update(id, { lockedUntil })
      this.logger.warn(`Account locked for userId=${id} until=${lockedUntil.toISOString()}`)
    }
  }

  async resetFailedLogins(id: string): Promise<void> {
    await this.usersRepository.update(id, { failedLoginAttempts: 0, lockedUntil: null })
    this.logger.log(`Failed login counter reset for userId=${id}`)
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<UserEntity> {
    await this.usersRepository.update(id, {
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
    })
    this.logger.log(`Profile updated for userId=${id}`)
    return this.findByIdOrFail(id)
  }
}
