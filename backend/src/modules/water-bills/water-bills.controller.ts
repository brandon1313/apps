import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Public } from '@/common/decorators/public.decorator'
import { SearchWaterBillsDto } from './dto/search-water-bills.dto'
import { WaterBillsService } from './water-bills.service'

@Controller('water-bills')
export class WaterBillsController {
  constructor(private readonly waterBillsService: WaterBillsService) {}

  @Public()
  @Post('search')
  search(@Body() dto: SearchWaterBillsDto) {
    return this.waterBillsService.search(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  pay(@Req() request: { user: { sub: string } }, @Param('id') id: string) {
    return this.waterBillsService.payBill(id, request.user.sub)
  }
}
