import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/types/jwt-payload';
import { CustomersService } from '../customers/customers.service';
import { AdjustInventoryDto } from '../inventory/dto/adjust-inventory.dto';
import { InventoryService } from '../inventory/inventory.service';
import { UpdateOrderStatusDto } from '../orders/dto/order.dto';
import { OrdersService } from '../orders/orders.service';
import { CreateProductDto, UpdateProductDto } from '../products/dto/product.dto';
import { ProductsService } from '../products/products.service';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly products: ProductsService,
    private readonly orders: OrdersService,
    private readonly inventory: InventoryService,
    private readonly customers: CustomersService,
  ) {}

  @Get('dashboard')
  getDashboard() {
    return this.admin.getDashboard();
  }

  @Get('products')
  findProducts() {
    return this.products.findAll({ includeInactive: true });
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Get('orders')
  findOrders() {
    return this.orders.findAll();
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @CurrentUser() user: JwtPayload) {
    return this.orders.updateStatus(id, dto.status, user.sub);
  }

  @Get('inventory')
  findInventory() {
    return this.inventory.findAll();
  }

  @Post('inventory/adjust')
  adjustInventory(@Body() dto: AdjustInventoryDto, @CurrentUser() user: JwtPayload) {
    return this.inventory.adjust(dto, user.sub);
  }

  @Get('clients')
  findClients() {
    return this.customers.findAll();
  }
}
