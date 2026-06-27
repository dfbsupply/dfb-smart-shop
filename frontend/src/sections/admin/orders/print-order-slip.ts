import type { Order } from 'src/data/types';

import { fDateTime } from 'src/utils/format-time';

import { ORDER_STATUS_LABEL } from 'src/data/status';
import { fPeso, formatItemSize, computeUnitPrice } from 'src/data/pricing';

// ----------------------------------------------------------------------
// Print Order Slip — opens a clean, self-contained print document in a new
// window (so the dashboard chrome, sidebar and edit controls are never
// printed). The letterhead mirrors the physical DFB business card: a coral
// header band with the green "DFB" logo badge, full contact details, then the
// order, item breakdown and signature lines.
// ----------------------------------------------------------------------

const BRAND = {
  green: '#03412D', // DFB pine green (app primary)
  greenDark: '#022E20',
  red: '#D45A4F', // card header band
  ink: '#1C252E',
  muted: '#637381',
  line: '#DFE3E8',
};

// From the DFB Glass & Aluminum Supply business card.
const BUSINESS = {
  name: 'DFB GLASS AND ALUMINUM SUPPLY',
  proprietress: 'Lorie Bandong — Proprietress',
  mainAddress: 'Main: B5 L4 P. Gomez St., Reyes Comp., Brgy. Manggahan, Pasig City',
  mainTel: 'Tel: (02) 8682-08-74 / (02) 8697-18-86',
  mobile: 'Mobile: 0942-016-1332',
  branchAddress:
    'Branch: L6 B1 Unit 8-A, Greenheights Executive Homes Phase 3 (Along F. Manalo St.), San Isidro, Cainta, Rizal',
  branchTel: 'Tel: (02) 8668-73-62',
  email: 'dfbglassandaluminumsupply@gmail.com',
};

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildRows(order: Order): string {
  return order.items
    .map((item) => {
      const b = computeUnitPrice({ base: item.basePrice, width: item.width, height: item.height });
      return `
        <tr>
          <td>
            <div class="name">${esc(item.name)}</div>
            <div class="muted small">base ${esc(fPeso(b.base))} · surface ${esc(
              fPeso(b.surface)
            )} · perimeter ${esc(fPeso(b.perimeter))}</div>
          </td>
          <td class="nowrap">${esc(formatItemSize(item.width, item.height))}</td>
          <td class="center">${esc(item.qty)}</td>
          <td class="right nowrap">${esc(fPeso(item.unitPrice))}</td>
          <td class="right nowrap">${esc(fPeso(item.lineTotal))}</td>
        </tr>`;
    })
    .join('');
}

export function printOrderSlip(order: Order): void {
  const fulfilment =
    order.fulfilment === 'delivery' ? 'Delivery (quote separately)' : 'Pickup at store';

  const confirmedRow =
    order.confirmedAmount != null
      ? `<div class="total-row grand">
           <span>Final Confirmed Amount</span>
           <span>${esc(fPeso(order.confirmedAmount))}</span>
         </div>`
      : '';

  const addressRow =
    order.fulfilment === 'delivery' && order.address
      ? `<div><span class="muted">Address:</span> ${esc(order.address)}</div>`
      : '';

  const notesBlock = order.notes
    ? `<div class="notes">
         <div class="notes-title">Customer notes</div>
         <div>${esc(order.notes)}</div>
       </div>`
    : '';

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Order Slip ${esc(order.code)}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: ${BRAND.ink};
      font-size: 12px;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet { max-width: 760px; margin: 0 auto; padding: 24px; }
    .muted { color: ${BRAND.muted}; }
    .small { font-size: 10px; }
    .nowrap { white-space: nowrap; }
    .center { text-align: center; }
    .right { text-align: right; }

    /* Letterhead */
    .head {
      display: flex; align-items: center; gap: 16px;
      background: linear-gradient(135deg, ${BRAND.red} 0%, #E89A4F 100%);
      color: #fff; padding: 16px 20px; border-radius: 8px 8px 0 0;
    }
    .badge {
      flex: 0 0 auto; width: 78px; height: 52px; border-radius: 50%;
      background: linear-gradient(135deg, #6FBF4E 0%, ${BRAND.greenDark} 100%);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 22px; letter-spacing: 1px;
      border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25);
    }
    .head .biz { font-size: 18px; font-weight: 800; letter-spacing: .5px; }
    .head .tag { font-size: 11px; opacity: .95; }

    .contact {
      border: 1px solid ${BRAND.line}; border-top: none;
      padding: 10px 20px; display: grid; grid-template-columns: 1fr 1fr;
      gap: 2px 24px; font-size: 11px; color: ${BRAND.muted};
      border-radius: 0 0 8px 8px;
    }
    .contact .prop { color: ${BRAND.ink}; font-weight: 700; grid-column: 1 / -1; }
    .contact .email { grid-column: 1 / -1; }

    /* Title */
    .title {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin: 22px 0 12px;
    }
    .title h1 { margin: 0; font-size: 20px; letter-spacing: 1px; color: ${BRAND.green}; }
    .title .meta { text-align: right; font-size: 11px; color: ${BRAND.muted}; }
    .title .meta b { color: ${BRAND.ink}; font-size: 13px; }
    .pill {
      display: inline-block; padding: 2px 10px; border-radius: 999px;
      background: ${BRAND.green}; color: #fff; font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: .5px;
    }

    /* Customer */
    .section-label {
      font-size: 10px; text-transform: uppercase; letter-spacing: 1px;
      color: ${BRAND.muted}; font-weight: 700; margin: 16px 0 6px;
    }
    .customer { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; }

    /* Items */
    table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    thead th {
      text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .5px;
      color: ${BRAND.muted}; border-bottom: 2px solid ${BRAND.ink};
      padding: 6px 8px;
    }
    thead th.center { text-align: center; }
    thead th.right { text-align: right; }
    tbody td { padding: 8px; border-bottom: 1px solid ${BRAND.line}; vertical-align: top; }
    tbody .name { font-weight: 600; }

    /* Totals */
    .totals { margin-top: 14px; margin-left: auto; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .total-row.grand {
      border-top: 2px solid ${BRAND.ink}; margin-top: 4px; padding-top: 8px;
      font-weight: 800; font-size: 14px; color: ${BRAND.green};
    }

    .notes {
      margin-top: 16px; padding: 10px 12px; border-radius: 6px;
      background: #FFF7E6; border: 1px solid #FFE0A3; font-size: 11px;
    }
    .notes-title { font-weight: 700; color: #8A5A00; margin-bottom: 2px; }

    /* Signatures */
    .signs { display: flex; gap: 40px; margin-top: 48px; }
    .sign { flex: 1; text-align: center; }
    .sign .line { border-top: 1px solid ${BRAND.ink}; padding-top: 6px; font-size: 11px; }

    .foot {
      margin-top: 28px; padding-top: 10px; border-top: 1px dashed ${BRAND.line};
      text-align: center; font-size: 10px; color: ${BRAND.muted};
    }

    @media print {
      .sheet { padding: 0; }
      @page { margin: 14mm; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="head">
      <div class="badge">DFB</div>
      <div>
        <div class="biz">${esc(BUSINESS.name)}</div>
        <div class="tag">Sliding &amp; swing windows · doors · tempered glass · shower enclosures · showcase</div>
      </div>
    </div>
    <div class="contact">
      <div class="prop">${esc(BUSINESS.proprietress)}</div>
      <div>${esc(BUSINESS.mainAddress)}</div>
      <div>${esc(BUSINESS.branchAddress)}</div>
      <div>${esc(BUSINESS.mainTel)} · ${esc(BUSINESS.mobile)}</div>
      <div>${esc(BUSINESS.branchTel)}</div>
      <div class="email">${esc(BUSINESS.email)}</div>
    </div>

    <div class="title">
      <h1>ORDER SLIP</h1>
      <div class="meta">
        <div><b>${esc(order.code)}</b></div>
        <div>${esc(fDateTime(order.createdAt))}</div>
        <div><span class="pill">${esc(ORDER_STATUS_LABEL[order.status])}</span></div>
      </div>
    </div>

    <div class="section-label">Customer</div>
    <div class="customer">
      <div><span class="muted">Name:</span> ${esc(order.customerName)}</div>
      <div><span class="muted">Mobile:</span> ${esc(order.customerMobile)}</div>
      <div><span class="muted">Email:</span> ${esc(order.customerEmail)}</div>
      <div><span class="muted">Fulfilment:</span> ${esc(fulfilment)}</div>
      ${addressRow}
    </div>

    <div class="section-label">Items</div>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Custom Size</th>
          <th class="center">Qty</th>
          <th class="right">Unit Price</th>
          <th class="right">Line Total</th>
        </tr>
      </thead>
      <tbody>${buildRows(order)}</tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span class="muted">Estimated Total</span>
        <span>${esc(fPeso(order.estTotal))}</span>
      </div>
      ${confirmedRow}
    </div>

    ${notesBlock}

    <div class="signs">
      <div class="sign"><div class="line">Prepared by (DFB Staff)</div></div>
      <div class="sign"><div class="line">Received by (Customer)</div></div>
    </div>

    <div class="foot">
      Payment is arranged with the customer offline. This slip is a summary of the
      order and is not an official receipt.<br/>
      Thank you for choosing ${esc(BUSINESS.name)}.
    </div>
  </div>
  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
    window.onafterprint = function () { window.close(); };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=820,height=900');
  if (!win) {
    // Pop-up blocked — fall back to printing the current page.
    window.print();
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
