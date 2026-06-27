// ----------------------------------------------------------------------
// Print Report — opens a clean, self-contained print document in a new window
// (so the dashboard chrome is never printed). Shares the DFB letterhead look
// of the order slip: a coral header band with the logo, then the report title,
// date range and the data table.
// ----------------------------------------------------------------------

const BRAND = {
  green: '#03412D',
  red: '#D45A4F',
  ink: '#1C252E',
  muted: '#637381',
  line: '#DFE3E8',
};

const BUSINESS = {
  name: 'DFB GLASS AND ALUMINUM SUPPLY',
  address: 'B5 L4 P. Gomez St., Reyes Comp., Brgy. Manggahan, Pasig City',
  contact: 'Tel: (02) 8682-08-74 · Mobile: 0942-016-1332 · dfbglassandaluminumsupply@gmail.com',
};

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type PrintReportInput = {
  title: string;
  columns: string[];
  rows: (string | number)[][];
  rangeLabel: string;
  generatedAt: string;
};

export function printReport({ title, columns, rows, rangeLabel, generatedAt }: PrintReportInput): void {
  const head = columns
    .map((c, i) => `<th class="${i === 0 ? '' : 'right'}">${esc(c)}</th>`)
    .join('');

  const body =
    rows.length === 0
      ? `<tr><td colspan="${columns.length}" class="empty">No data for this report.</td></tr>`
      : rows
          .map(
            (row) =>
              `<tr>${row
                .map(
                  (cell, i) =>
                    `<td class="${i === 0 ? '' : 'right'}${typeof cell === 'number' ? ' num' : ''}">${esc(
                      cell
                    )}</td>`
                )
                .join('')}</tr>`
          )
          .join('');

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: ${BRAND.ink}; font-size: 12px; line-height: 1.45;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .sheet { max-width: 820px; margin: 0 auto; padding: 24px; }
    .right { text-align: right; }
    .num { font-variant-numeric: tabular-nums; }

    .head {
      display: flex; align-items: center; gap: 14px;
      background: linear-gradient(135deg, ${BRAND.red} 0%, #E89A4F 100%);
      color: #fff; padding: 14px 18px; border-radius: 8px 8px 0 0;
    }
    .badge {
      flex: 0 0 auto; width: 70px; height: 50px; border-radius: 9px; padding: 5px;
      background: #fff; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 1px 3px rgba(0,0,0,.25);
    }
    .badge img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
    .head .biz { font-size: 17px; font-weight: 800; letter-spacing: .5px; }
    .head .sub { font-size: 10.5px; opacity: .95; }

    .meta {
      border: 1px solid ${BRAND.line}; border-top: none; border-radius: 0 0 8px 8px;
      padding: 10px 18px; display: flex; justify-content: space-between; align-items: flex-end;
      flex-wrap: wrap; gap: 6px;
    }
    .meta h1 { margin: 0; font-size: 18px; color: ${BRAND.green}; }
    .meta .range { font-size: 11px; color: ${BRAND.muted}; }
    .meta .gen { font-size: 11px; color: ${BRAND.muted}; text-align: right; }

    table { width: 100%; border-collapse: collapse; margin-top: 18px; }
    thead th {
      font-size: 10px; text-transform: uppercase; letter-spacing: .5px; text-align: left;
      color: ${BRAND.muted}; border-bottom: 2px solid ${BRAND.ink}; padding: 8px 10px;
    }
    thead th.right { text-align: right; }
    tbody td { padding: 8px 10px; border-bottom: 1px solid ${BRAND.line}; }
    tbody tr:nth-child(even) td { background: #FAFBFC; }
    td.empty { text-align: center; color: ${BRAND.muted}; padding: 28px; }

    .foot {
      margin-top: 22px; padding-top: 10px; border-top: 1px dashed ${BRAND.line};
      text-align: center; font-size: 10px; color: ${BRAND.muted};
    }
    @media print { .sheet { padding: 0; } @page { margin: 14mm; } }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="head">
      <div class="badge"><img src="/apple-touch-icon.png" alt="DFB" /></div>
      <div>
        <div class="biz">${esc(BUSINESS.name)}</div>
        <div class="sub">${esc(BUSINESS.address)}</div>
        <div class="sub">${esc(BUSINESS.contact)}</div>
      </div>
    </div>
    <div class="meta">
      <div>
        <h1>${esc(title)}</h1>
        <div class="range">Date range: ${esc(rangeLabel)}</div>
      </div>
      <div class="gen">Generated<br/>${esc(generatedAt)}</div>
    </div>

    <table>
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>

    <div class="foot">
      For record-keeping — the digital replacement for the manual logbook.<br/>
      ${esc(BUSINESS.name)}
    </div>
  </div>
  <script>
    window.onload = function () { window.focus(); window.print(); };
    window.onafterprint = function () { window.close(); };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=900');
  if (!win) {
    window.print();
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
