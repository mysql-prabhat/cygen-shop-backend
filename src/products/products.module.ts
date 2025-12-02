import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthModule } from '../auth/auth.module';

@Module({
   imports: [
    AuthModule,
  ],
  controllers: [ProductsController],
  providers: [PrismaService, RedisService, JwtStrategy],
})
export class ProductsModule {}