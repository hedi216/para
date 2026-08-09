import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/types/jwt-payload';
import { CreatePosSaleDto, RefundPosSaleDto } from './dto/pos-sale.dto';
import { PosService } from './pos.service';

@Controller('pos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
export class PosController {
  constructor(private readonly pos: PosService) {}

  @Get('products')
  getProducts(@Query('search') search?: string) {
    return this.pos.getProducts(search);
  }

  @Get('products/barcode/:barcode')
  getProductByBarcode(@Param('barcode') barcode: string) {
    return this.pos.getProductByBarcode(barcode);
  }

  @Post('sales')
  createSale(@CurrentUser() user: JwtPayload, @Body() dto: CreatePosSaleDto) {
    return this.pos.createSale(user.sub, dto);
  }

  @Get('sales')
  findAll() {
    return this.pos.findAll();
  }

  @Post('sales/:id/refund')
  refundSale(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() dto: RefundPosSaleDto) {
    return this.pos.refundSale(id, user.sub, dto);
  }
}
