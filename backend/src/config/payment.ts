import Stripe from 'stripe';
import { SubscriptionPlan } from '../types/index.js';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'usd',
    duration: 365,
    features: [
      'Basic Blockly programming',
      '2D robot simulation',
      '5 project saves',
      'Community support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    currency: 'usd',
    duration: 30,
    features: [
      'All Free features',
      '3D robot simulation with physics',
      'Unlimited project saves',
      'Access to all maps',
      'Custom robot configurations',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29.99,
    currency: 'usd',
    duration: 30,
    features: [
      'All Premium features',
      'Custom map creation',
      'Advanced analytics',
      'Multi-user collaboration',
      'API access',
      'Dedicated support',
      'Custom branding',
    ],
  },
];

export const getSubscriptionPlan = (planId: string): SubscriptionPlan | undefined => {
  return subscriptionPlans.find((plan) => plan.id === planId);
};

export const stripeConfig = {
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  successUrl: `${process.env.CLIENT_URL}/payment/success`,
  cancelUrl: `${process.env.CLIENT_URL}/payment/cancel`,
};
