import type { Fulfilment } from 'src/data/types';

// ----------------------------------------------------------------------
// Client side of the order-notification email. Calls the Vercel serverless
// function /api/send-order-email (which holds the Resend key server-side).
// Best-effort: a failed/absent email endpoint must never block an order.
// (Locally under `vite dev` there is no /api, so this is a no-op; it works
// once deployed to Vercel, or under `vercel dev`.)
// ----------------------------------------------------------------------

export type OrderEmailPayload = {
  code: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  fulfilment: Fulfilment;
  address?: string;
  notes?: string;
  estTotal: number;
  items: { name: string; width: number; height: number; qty: number; unitPrice: number }[];
};

export async function sendOrderEmail(payload: OrderEmailPayload): Promise<void> {
  try {
    await fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    /* best-effort — never block checkout on email */
  }
}
