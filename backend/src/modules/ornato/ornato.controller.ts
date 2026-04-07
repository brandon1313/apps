import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Public } from '@/common/decorators/public.decorator'
import { CreateOrnatoTicketDto } from './dto/create-ornato-ticket.dto'
import { OrnatoService } from './ornato.service'

@Controller('ornato')
export class OrnatoController {
  constructor(private readonly ornatoService: OrnatoService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateOrnatoTicketDto) {
    return this.ornatoService.create(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  pay(@Param('id') id: string, @Req() request: { user: { sub: string } }) {
    return this.ornatoService.pay(id, request.user.sub)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/receipt')
  getReceipt(@Param('id') id: string) {
    return this.ornatoService.getReceipt(id)
  }
}
