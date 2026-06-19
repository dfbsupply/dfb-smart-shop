import type { VercelRequest, VercelResponse } from '@vercel/node';

import { Resend } from 'resend';

// ----------------------------------------------------------------------
// Phase 7 — Order notification email (Resend), server-side.
//
// The frontend calls POST /api/send-order-email after a successful checkout.
// The Resend API key lives ONLY in the server env (RESEND_API_KEY) — never in
// the browser bundle. On the Resend free tier (no verified domain), the From
// must be onboarding@resend.dev and delivery only works to the address the
// Resend account is registered under; once the Namecheap domain is verified
// (Phase 8), set ORDER_EMAIL_FROM to a real shop address.
// ----------------------------------------------------------------------

const TO = process.env.ORDER_NOTIFICATION_TO ?? 'dfbglassandaluminumsupply@proton.me';
const FROM = process.env.ORDER_EMAIL_FROM ?? 'DFB Smart Shop <onboarding@resend.dev>';

type OrderItem = {
  name: string;
  width: number;
  height: number;
  qty: number;
  unitPrice: number;
};

type OrderPayload = {
  code: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  fulfilment: 'pickup' | 'delivery';
  address?: string;
  notes?: string;
  estTotal: number;
  items: OrderItem[];
};

const peso = (n: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(n);

function buildHtml(o: OrderPayload): string {
  const rows = o.items
    .map(
      (i) => `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${i.name}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${i.width}×${i.height} in</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${peso(i.unitPrice * i.qty)}</td>
      </tr>`
    )
    .join('');

  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
    <h2 style="margin:0 0 4px">New order ${o.code}</h2>
    <p style="color:#555;margin:0 0 16px">A customer placed an order on the webshop.</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      <thead><tr>
        <th style="text-align:left;padding:6px 10px;border-bottom:2px solid #333">Item</th>
        <th style="text-align:left;padding:6px 10px;border-bottom:2px solid #333">Size</th>
        <th style="text-align:center;padding:6px 10px;border-bottom:2px solid #333">Qty</th>
        <th style="text-align:right;padding:6px 10px;border-bottom:2px solid #333">Line total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:16px;margin:16px 0"><strong>Estimated total: ${peso(o.estTotal)}</strong>
      <span style="color:#888;font-size:12px"> (shop confirms final amount)</span></p>
    <h3 style="margin:20px 0 6px">Customer</h3>
    <p style="margin:0;font-size:14px;line-height:1.6">
      ${o.customerName}<br/>
      ${o.customerMobile}${o.customerEmail ? ` · ${o.customerEmail}` : ''}<br/>
      ${o.fulfilment === 'delivery' ? `Delivery${o.address ? ` — ${o.address}` : ''}` : 'Pickup at store'}
      ${o.notes ? `<br/><em>Notes: ${o.notes}</em>` : ''}
    </p>
  </div>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email is not configured (RESEND_API_KEY missing).' });
  }

  const o = req.body as OrderPayload;
  if (!o || !o.code || !Array.isArray(o.items)) {
    return res.status(400).json({ error: 'Invalid order payload.' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: TO,
    subject: `New order ${o.code} — ${o.customerName}`,
    html: buildHtml(o),
    replyTo: o.customerEmail || undefined,
  });

  if (error) {
    return res.status(502).json({ error: error.message });
  }
  return res.status(200).json({ id: data?.id ?? null });
}
