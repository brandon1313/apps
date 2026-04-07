import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { AccessTokenPayload } from '@/modules/auth/strategies/jwt.strategy'
import { DashboardService } from './dashboard.service'

@SkipThrottle()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Req() request: { user: AccessTokenPayload }) {
    return this.dashboardService.getSummary(request.user)
  }
}
