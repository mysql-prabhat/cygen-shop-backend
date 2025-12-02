import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Don't forget imports!
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OrdersModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    PaymentsModule,
    PrismaModule,
  ],
  // You would typically add controllers and providers here
})
export class AppModule {}