import { Controller, Post, Body, Req, UseGuards } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtService } from "@nestjs/jwt";

@Controller("api/payments")
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {console.log('Beore guard');}

  calculateAmount(cart: any[]) {
    return cart.reduce((sum, item) => (sum + item.price * (item.qty ?? 1), 0) * 100).toFixed(2);
  }


  @UseGuards(JwtAuthGuard)
  @Post("create-payment-intent")
  async create(@Req() req: any, @Body() body: any) {
    console.log('req.user  ',req.user);
    
    const userId = req.user.id;
    const { items, currency = "inr" } = body;
    console.log(items);
    
    let amount = items.reduce((sum :any, item:any) => { return sum + item.price }, 0) * 100; 
    amount = parseInt(amount.toFixed(2));
    console.log('amount =>',amount);
    
    // 1) Create PENDING order
    const order = await this.prisma.order.create({
                  data: {
                    userId,
                    amount,
                    status: "PENDING",
                    items: {
                      create: items.map((it:any) => ({
                        productId: (it.id).toString(),
                        name: it.title,
                        unitPriceCents: parseInt((it.price * 100).toFixed(2)),
                        quantity: it.qty ?? 1,
                      })),
                    },
                  },
                });

    // 2) Create payment intent
    const pi = await this.paymentsService.createPaymentIntent(
      amount,
      currency,
      { orderId: order.id }
    );

    return {
      clientSecret: pi.client_secret,
      orderId: order.id,
      paymentIntentId: pi.id,
    };
  }
}