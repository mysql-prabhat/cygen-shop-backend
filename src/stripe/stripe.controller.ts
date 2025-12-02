import { Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import Stripe from 'stripe';
import { OrdersService } from '../orders/orders.service';
import 'dotenv/config';

@Controller('stripe')
export class StripeController {
  private stripe: Stripe;
  
  constructor(private ordersService: OrdersService) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2022-11-15',
    });
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Req() req: any, @Res() res: any) {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).send("Missing stripe-signature header");
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.orderId;

      if (orderId) {
        try {
          await this.ordersService.markOrderPaid(orderId, pi.id);
        } catch (e) {
          console.error("Error updating order:", e);
        }
      }
    }

    return res.send({ received: true });
  }
}
