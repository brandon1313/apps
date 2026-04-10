import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { Public } from '@/common/decorators/public.decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { AccessTokenPayload } from './strategies/jwt.strategy'

const REFRESH_COOKIE = 'refresh_token'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setRefreshCookie(res: Response, token: string): void {
    const ttlDays = this.configService.getOrThrow<number>('JWT_REFRESH_TTL_DAYS')
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: ttlDays * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    })
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
  }

  @Public()
  @Throttle({ auth: { limit: 10, ttl: 900_000 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.register(dto)
    this.setRefreshCookie(res, refreshToken)
    return { accessToken }
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 900_000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto)
    this.setRefreshCookie(res, refreshToken)
    return { accessToken }
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token: string | undefined = req.cookies?.[REFRESH_COOKIE]

    if (!token) {
      throw new UnauthorizedException('Refresh token missing')
    }

    const { accessToken, refreshToken } = await this.authService.refresh(token)
    this.setRefreshCookie(res, refreshToken)
    return { accessToken }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: { user: AccessTokenPayload },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.sub)
    this.clearRefreshCookie(res)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: { user: AccessTokenPayload }) {
    return request.user
  }
}
