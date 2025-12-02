import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards ,Options} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';

 console.log('In list');
@Controller('api/orders')
//@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private svc: OrdersService, private redis: RedisService, private jwtService: JwtService) {}
  @Options()
  handleOptions() {
    return;
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() req: any, @Query('search') search = '', @Query('page') page = '1') {
    
    
    const pageNum = parseInt(page, 10) || 1;
    const cacheKey = `orders:${search}|${pageNum}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    const user = req.user;
    console.log('In list 2',user);
    const result = await this.svc.listOrders(user.id, search, pageNum);
    console.log('order list result',result);
    await this.redis.set(cacheKey, JSON.stringify(result), 30);
    return result;
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateOrderDto) {
    const res = await this.svc.createOrder(req.user.id, dto.items);
    return { orderId: res.order.id, clientSecret: res.clientSecret };
  }

  @Patch(':id/pay')
  async pay(@Param('id') id: string, @Body('paymentIntentId') piId: string) {
    return this.svc.markOrderPaid(id, piId);
  }
}