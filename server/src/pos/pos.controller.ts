import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/types/jwt-payload';
import {
  CreatePosCustomerDto,
  CreatePosInvoiceDto,
  CreatePosProductDto,
  CreatePosSaleDto,
  PosStockAdjustDto,
  RefundPosSaleDto,
} from './dto/pos-sale.dto';
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

  @Post('products')
  createProduct(@CurrentUser() user: JwtPayload, @Body() dto: CreatePosProductDto) {
    return this.pos.createProduct(dto, user);
  }

  @Get('products/barcode/:barcode')
  getProductByBarcode(@Param('barcode') barcode: string) {
    return this.pos.getProductByBarcode(barcode);
  }

  @Get('categories')
  getCategories() {
    return this.pos.getCategories();
  }

  @Get('brands')
  getBrands() {
    return this.pos.getBrands();
  }

  @Get('stock')
  getStock(@Query('search') search?: string, @Query('category') category?: string) {
    return this.pos.getStock(search, category);
  }

  @Post('stock/adjust')
  adjustStock(@CurrentUser() user: JwtPayload, @Body() dto: PosStockAdjustDto) {
    return this.pos.adjustStock(dto, user.sub);
  }

  @Get('customers')
  getCustomers(@Query('search') search?: string) {
    return this.pos.getCustomers(search);
  }

  @Post('customers')
  createCustomer(@Body() dto: CreatePosCustomerDto) {
    return this.pos.createCustomer(dto);
  }

  @Post('sales')
  createSale(@CurrentUser() user: JwtPayload, @Body() dto: CreatePosSaleDto) {
    return this.pos.createSale(user.sub, dto);
  }

  @Get('sales')
  findAll() {
    return this.pos.findAll();
  }

  @Get('sales/:id')
  findOneSale(@Param('id') id: string) {
    return this.pos.findOne(id);
  }

  @Post('sales/:id/refund')
  refundSale(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() dto: RefundPosSaleDto) {
    return this.pos.refundSale(id, user.sub, dto);
  }

  @Post('invoices')
  createInvoice(@Body() dto: CreatePosInvoiceDto) {
    return this.pos.createInvoice(dto);
  }

  @Get('invoices')
  findInvoices() {
    return this.pos.findInvoices();
  }

  @Get('invoices/:id')
  findInvoice(@Param('id') id: string) {
    return this.pos.findInvoice(id);
  }
}
