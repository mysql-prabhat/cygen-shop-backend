import { Injectable } from "@nestjs/common";
import Stripe from "stripe";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>("STRIPE_SECRET_KEY");
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set in environment. Set STRIPE_SECRET_KEY in your .env or environment variables."
      );
    }

    this.stripe = new Stripe(key, {
      apiVersion: "2022-11-15",
    });
  }

  async createPaymentIntent(
    amount: number,
    currency = 'inr',
    metadata: Record<string, any> = {},
  ) {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
      metadata,
    });
  }

  constructEvent(rawBody: Buffer, signature: string, secret: string) {
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
  }
}
