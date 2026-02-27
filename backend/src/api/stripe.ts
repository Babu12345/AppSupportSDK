import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

const router = Router();
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || '';

// Helper to get user from JWT
async function getUserFromToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET) as { userId: string };
    return prisma.user.findUnique({ where: { id: decoded.userId } });
  } catch {
    return null;
  }
}

// POST /v1/stripe/checkout — Create Stripe Checkout Session
router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Already pro?
    if (user.subscriptionTier === 'pro' && user.stripeCustomerId) {
      // Redirect to portal instead
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${req.headers.origin || 'https://www.appsupportsdk.com'}/billing`,
      });
      res.json({ url: session.url });
      return;
    }

    // Build checkout session params
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRO_PRICE_ID, quantity: 1 }],
      success_url: `${req.headers.origin || 'https://www.appsupportsdk.com'}/billing?success=true`,
      cancel_url: `${req.headers.origin || 'https://www.appsupportsdk.com'}/billing`,
      metadata: { userId: user.id },
      customer_email: user.stripeCustomerId ? undefined : user.email,
    };

    // Use existing customer if available
    if (user.stripeCustomerId) {
      params.customer = user.stripeCustomerId;
      delete params.customer_email;
    }

    // Add 7-day trial if user hasn't used it
    if (!user.hasUsedTrial) {
      params.subscription_data = { trial_period_days: 7 };
    }

    const session = await stripe.checkout.sessions.create(params);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /v1/stripe/portal — Create Stripe Billing Portal session
router.post('/portal', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!user.stripeCustomerId) {
      res.status(400).json({ error: 'No billing account found' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${req.headers.origin || 'https://www.appsupportsdk.com'}/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// POST /v1/stripe/webhook — Handle Stripe webhook events
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionTier: 'pro',
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              hasUsedTrial: true,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: subscription.customer as string },
        });
        if (user) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          await prisma.user.update({
            where: { id: user.id },
            data: { subscriptionTier: isActive ? 'pro' : 'free' },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: subscription.customer as string },
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionTier: 'free',
              stripeSubscriptionId: null,
            },
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export { router as stripeRouter };
