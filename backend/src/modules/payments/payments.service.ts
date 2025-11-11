import Stripe from 'stripe';
import Payment from './payments.model.js';
import User from '../users/users.model.js';
import { stripe, getSubscriptionPlan, stripeConfig } from '../../config/payment.js';
import { AppError } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export class PaymentService {
  async createCheckoutSession(userId: string, planId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const plan = getSubscriptionPlan(planId);
    if (!plan || plan.id === 'free') {
      throw new AppError('Invalid subscription plan', 400);
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: plan.currency,
              product_data: {
                name: `${plan.name} Subscription`,
                description: plan.features.join(', '),
              },
              unit_amount: Math.round(plan.price * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${stripeConfig.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: stripeConfig.cancelUrl,
        client_reference_id: userId,
        metadata: {
          userId,
          planId,
          duration: plan.duration.toString(),
        },
      });

      // Create pending payment record
      await Payment.create({
        userId,
        amount: plan.price,
        currency: plan.currency,
        status: 'pending',
        subscriptionType: planId as 'premium' | 'enterprise',
        paymentMethod: 'stripe',
        transactionId: session.id,
        stripeSessionId: session.id,
      });

      logger.info(`Checkout session created for user ${userId}: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error: any) {
      logger.error('Stripe checkout session creation failed:', error);
      throw new AppError('Failed to create checkout session', 500);
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        stripeConfig.webhookSecret
      );

      logger.info(`Stripe webhook received: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'payment_intent.succeeded':
          logger.info('Payment intent succeeded');
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error: any) {
      logger.error('Webhook error:', error);
      throw new AppError('Webhook signature verification failed', 400);
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.client_reference_id || session.metadata?.userId;
    const planId = session.metadata?.planId;
    const duration = parseInt(session.metadata?.duration || '30');

    if (!userId || !planId) {
      logger.error('Missing metadata in checkout session');
      return;
    }

    try {
      // Update payment status
      await Payment.findOneAndUpdate(
        { stripeSessionId: session.id },
        { status: 'completed' }
      );

      // Update user subscription
      const subscriptionExpiry = new Date();
      subscriptionExpiry.setDate(subscriptionExpiry.getDate() + duration);

      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: planId,
        subscriptionExpiry,
      });

      logger.info(`Subscription activated for user ${userId}: ${planId}`);
    } catch (error) {
      logger.error('Error handling checkout session completed:', error);
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      await Payment.findOneAndUpdate(
        { transactionId: paymentIntent.id },
        { status: 'failed' }
      );

      logger.warn(`Payment failed: ${paymentIntent.id}`);
    } catch (error) {
      logger.error('Error handling payment failed:', error);
    }
  }

  async getPaymentHistory(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments({ userId }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async verifySession(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return {
        status: session.payment_status,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      };
    } catch (error) {
      logger.error('Error verifying session:', error);
      throw new AppError('Failed to verify payment session', 500);
    }
  }
}

export default new PaymentService();
