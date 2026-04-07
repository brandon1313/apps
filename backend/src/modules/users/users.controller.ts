import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { UsersService } from './users.service'
import { UpdateProfileDto } from './dto/update-profile.dto'

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@Req() request: { user: { sub: string } }) {
    return this.usersService.findByIdOrFail(request.user.sub)
  }

  @Patch('me')
  async updateMe(@Req() request: { user: { sub: string } }, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(request.user.sub, dto)
  }
}
