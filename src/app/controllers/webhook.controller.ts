import { Request, Response } from "express";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Note: To verify the webhook signature, we need the raw body. 
    // Express must be configured with express.raw({type: 'application/json'}) for this route.
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    
    // Fulfill the purchase...
    const { courseId, userId } = session.metadata;

    try {
      await prisma.$transaction(async (tx) => {
        // Update payment
        await tx.payment.update({
          where: { stripeSessionId: session.id },
          data: { status: 'completed', stripePaymentId: session.payment_intent as string }
        });

        // Create enrollment
        await tx.enrollment.upsert({
          where: { userId_courseId: { userId, courseId } },
          create: { userId, courseId },
          update: {}
        });
      });
    } catch (err) {
      console.error("Database transaction failed for fulfillment:", err);
      return res.status(500).send("Database transaction error");
    }
  } else if (event.type === 'checkout.session.expired') {
    const session = event.data.object as any;
    try {
      await prisma.payment.updateMany({
         where: { stripeSessionId: session.id, status: 'pending' },
         data: { status: 'failed' }
      });
    } catch(err) {
      console.error("Failed to mark session as failed", err);
    }
  } else if (event.type === 'charge.refunded') {
    const charge = event.data.object as any;
    try {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: charge.payment_intent as string }
      });
      if (payment) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'refunded' }
          });
          // Remove enrollment on refund
          await tx.enrollment.delete({
            where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } }
          });
        });
      }
    } catch(err) {
      console.error("Failed to process refund event", err);
    }
  }

  res.status(200).send({ received: true });
};
