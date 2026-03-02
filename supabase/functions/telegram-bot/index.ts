// ML Coach Telegram Bot — Supabase Edge Function Entry Point
// Receives Telegram webhook POST requests and routes to the command handler.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleUpdate } from './analyzer.ts';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET');

serve(async (req: Request) => {
  // Only accept POST requests (Telegram sends POST for each update)
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Validate Telegram's secret token header (if configured)
  if (TELEGRAM_WEBHOOK_SECRET) {
    const incomingSecret = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (incomingSecret !== TELEGRAM_WEBHOOK_SECRET) {
      console.warn('Unauthorized webhook request — invalid secret token');
      return new Response('Unauthorized', { status: 401 });
    }
  }

  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set');
    return new Response('Server misconfigured', { status: 500 });
  }

  let update: Record<string, unknown>;
  try {
    update = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Process the update asynchronously — we respond 200 immediately so Telegram
  // does not retry the request while we're still processing
  try {
    await handleUpdate(update as Parameters<typeof handleUpdate>[0], TELEGRAM_BOT_TOKEN);
  } catch (err) {
    console.error('Error handling Telegram update:', err);
    // Still return 200 to prevent Telegram from retrying indefinitely
  }

  return new Response('ok', { status: 200 });
});
