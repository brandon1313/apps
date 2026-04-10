import { Controller, Get } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { Public } from '@/common/decorators/public.decorator'

@SkipThrottle({ default: true, auth: true })
@Controller('health')
export class HealthController {
  @Public()
  @Get('live')
  live() {
    return { status: 'ok' }
  }

  @Public()
  @Get('ready')
  ready() {
    return { status: 'ready' }
  }
}
