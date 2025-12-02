import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { RedisService } from '../redis/redis.service';
import { Product } from '@prisma/client';

@Injectable()
export class OrdersService {
  private stripe: Stripe;
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2022-11-15',
    });
  }

  async listOrders(userId: string, search = '', page = 1, pageSize = 10) {
    this.prisma.$on("query", (e) => {
      console.log("SQL Query:", e.query);
      console.log("Params:", e.params);
    });
    const skip = (page - 1) * pageSize;
    console.log('listOrders userId',userId);
    
    const where: any = { userId };
   /*  if (search != '') {
      where.OR = [{ userId: { contains: search } }];
    } */
    console.log('where',JSON.stringify(where));
    
    const itemQuery = await this.prisma.order.findMany();
      console.log('itemQuery',itemQuery);
      
    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: { items: { include: { product: true } } },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async createOrder(
    userId: string,
    items: { productId: string; quantity: number }[],
  ) {
    if (!items.length)
      throw new BadRequestException('No items');

    const productIds = items.map((i) => i.productId);

    const products: Product[] = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // ⭐ Properly typed Map
    const map = new Map<string, Product>(
      products.map((p: Product) => [p.id, p]),
    );

    let total = 0;

    const orderItems = items.map((it) => {
      const p = map.get(it.productId);
      if (!p)
        throw new BadRequestException(
          `Product ${it.productId} not found`,
        );

      total += p.priceCents * it.quantity;

      return {
        productId: it.productId,
        quantity: it.quantity,
        unitPriceCents: p.priceCents,
      };
    });

    const created = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          amount: total,
          status: 'PENDING',
        },
      });

      for (const it of orderItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: it.productId,
            quantity: it.quantity,
            unitPriceCents: it.unitPriceCents,
          },
        });
      }

      return order;
    });

    const pi = await this.stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      metadata: { orderId: created.id },
    });

    await this.prisma.order.update({
      where: { id: created.id },
      data: {
        stripePaymentIntentId: pi.id,
      },
    });

    await this.redis.del('orders:*');

    return {
      order: created,
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
    };
  }

  async markOrderPaid(orderId: string, paymentIntentId?: string) {
    if (paymentIntentId) {
      const pi = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      if (pi.status !== 'succeeded')
        throw new BadRequestException('payment not succeeded');
    }

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    });

    await this.redis.del('orders:*');

    return order;
  }
}