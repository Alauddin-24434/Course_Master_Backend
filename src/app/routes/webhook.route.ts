import { Router } from "express";
import express from 'express';
import { stripeWebhook } from "../controllers/webhook.controller";

const router = Router();

// Stripe needs the raw body to construct the event
router.post("/", express.raw({ type: 'application/json' }), stripeWebhook);
export const webhookRouter = router;