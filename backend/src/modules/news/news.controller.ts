import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { NewsService } from './news.service'
import { Public } from '@/common/decorators/public.decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Roles } from '@/common/decorators/roles.decorator'
import { Role } from '@/common/enums/role.enum'
import { CreateNewsDto } from './dto/create-news.dto'
import { UpdateNewsStatusDto } from './dto/update-news-status.dto'

@SkipThrottle({ default: true, auth: true })
@Controller()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @Get('public/news')
  findPublished() {
    return this.newsService.findPublished()
  }

  @Public()
  @Get('public/news/:slug')
  findPublishedBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlugOrFail(slug)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.WRITER)
  @Get('news')
  findAll() {
    return this.newsService.findAll()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.WRITER)
  @Post('news')
  create(@Body() dto: CreateNewsDto, @Req() request: { user: { sub: string } }) {
    return this.newsService.create({
      ...dto,
      authorId: request.user.sub,
    })
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.WRITER)
  @Get('news/:id')
  findById(@Param('id') id: string) {
    return this.newsService.findByIdOrFail(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.WRITER)
  @Patch('news/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateNewsStatusDto) {
    return this.newsService.updateStatus(id, dto.status)
  }
}
