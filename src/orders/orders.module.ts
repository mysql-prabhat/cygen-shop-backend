import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthModule } from '../auth/auth.module';

@Module({
   imports: [
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, RedisService, JwtStrategy],
})
export class OrdersModule {}