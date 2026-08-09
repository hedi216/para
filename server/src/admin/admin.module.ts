import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { InventoryModule } from '../inventory/inventory.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [ProductsModule, OrdersModule, InventoryModule, CustomersModule],
  controllers: [AdminController],
})
export class AdminModule {}
