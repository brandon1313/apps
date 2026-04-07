import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from './entities/user.entity'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    const entity = this.usersRepository.create(user)
    return this.usersRepository.save(entity)
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
  }

  async incrementFailedLogins(id: string, maxAttempts: number, lockDurationMs: number): Promise<void> {
    await this.usersRepository.increment({ id }, 'failedLoginAttempts', 1)
    const user = await this.findByIdOrFail(id)
    if (user.failedLoginAttempts >= maxAttempts) {
      await this.usersRepository.update(id, { lockedUntil: new Date(Date.now() + lockDurationMs) })
    }
  }

  async resetFailedLogins(id: string): Promise<void> {
    await this.usersRepository.update(id, { failedLoginAttempts: 0, lockedUntil: null })
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<UserEntity> {
    await this.usersRepository.update(id, {
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
    })

    return this.findByIdOrFail(id)
  }
}
