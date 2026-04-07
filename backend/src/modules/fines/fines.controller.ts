import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Roles } from '@/common/decorators/roles.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { Role } from '@/common/enums/role.enum'
import { FinesService } from './fines.service'
import { SearchFinesDto } from './dto/search-fines.dto'
import { CreateFineDto } from './dto/create-fine.dto'

@Controller('fines')
export class FinesController {
  constructor(private readonly finesService: FinesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.POLICE, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateFineDto, @Req() req: { user: { sub: string } }) {
    return this.finesService.create(dto, req.user.sub)
  }

  @Public()
  @Post('search')
  async search(@Body() dto: SearchFinesDto) {
    await this.finesService.seedDemoData()
    return this.finesService.search(dto)
  }

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.finesService.findByIdOrFail(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  pay(@Param('id') id: string, @Req() request: { user: { sub: string } }) {
    return this.finesService.payFine(id, request.user.sub)
  }
}
