import type { Order, Product } from 'src/data/types';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { useAsync } from 'src/hooks/use-async';

import { fPeso } from 'src/data/pricing';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchOrders, fetchProducts } from 'src/services/db';
import { getStockStatus, ORDER_STATUS_LABEL } from 'src/data/status';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------
// A-9. Reports — the digital replacement for the manual logbook.
// ----------------------------------------------------------------------

type ReportType =
  | 'sales'
  | 'orders_by_status'
  | 'top_products'
  | 'low_stock'
  | 'reservations';

const REPORT_OPTIONS: { value: ReportType; label: string }[] = [
  { value: 'sales', label: 'Sales Summary' },
  { value: 'orders_by_status', label: 'Orders by Status' },
  { value: 'top_products', label: 'Top-Selling Products' },
  { value: 'low_stock', label: 'Low Stock Report' },
  { value: 'reservations', label: 'Reservations Report' },
];

type ReportTable = { columns: string[]; rows: (string | number)[][] };

function buildReport(type: ReportType, orders: Order[], products: Product[]): ReportTable {
  switch (type) {
    case 'sales': {
      const confirmed = orders.reduce((sum, o) => sum + (o.confirmedAmount ?? 0), 0);
      const estimated = orders.reduce((sum, o) => sum + o.estTotal, 0);
      return {
        columns: ['Metric', 'Value'],
        rows: [
          ['Total Orders', orders.length],
          ['Estimated Order Value', fPeso(estimated)],
          ['Confirmed Order Value', fPeso(confirmed)],
        ],
      };
    }
    case 'orders_by_status': {
      const counts: Record<string, number> = {};
      orders.forEach((o) => {
        counts[o.status] = (counts[o.status] ?? 0) + 1;
      });
      return {
        columns: ['Status', 'Count'],
        rows: Object.entries(counts).map(([status, count]) => [
          ORDER_STATUS_LABEL[status as keyof typeof ORDER_STATUS_LABEL] ?? status,
          count,
        ]),
      };
    }
    case 'top_products': {
      const totals: Record<string, number> = {};
      orders.forEach((o) =>
        o.items.forEach((i) => {
          totals[i.name] = (totals[i.name] ?? 0) + i.qty;
        })
      );
      return {
        columns: ['Product', 'Units Ordered'],
        rows: Object.entries(totals)
          .sort((a, b) => b[1] - a[1])
          .map(([name, qty]) => [name, qty]),
      };
    }
    case 'low_stock': {
      return {
        columns: ['Product', 'Stock Qty', 'Threshold', 'Status'],
        rows: products.filter((p) => getStockStatus(p) !== 'in_stock').map((p) => [
          p.name,
          p.stockQty,
          p.lowStockThreshold,
          getStockStatus(p) === 'out_of_stock' ? 'Out of Stock' : 'Low Stock',
        ]),
      };
    }
    case 'reservations': {
      return {
        columns: ['Order #', 'Customer', 'Status', 'Est. Total'],
        rows: orders.filter((o) => o.type === 'reservation').map((o) => [
          o.code,
          o.customerName,
          ORDER_STATUS_LABEL[o.status],
          fPeso(o.estTotal),
        ]),
      };
    }
    default:
      return { columns: [], rows: [] };
  }
}

function exportCsv(report: ReportTable, name: string) {
  const lines = [report.columns, ...report.rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([lines], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsView() {
  const { data, loading } = useAsync(async () => {
    const [orders, products] = await Promise.all([fetchOrders(), fetchProducts()]);
    return { orders, products };
  }, []);

  const [type, setType] = useState<ReportType>('sales');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState<ReportTable | null>(null);

  const label = REPORT_OPTIONS.find((r) => r.value === type)!.label;

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Reports
      </Typography>

      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Report"
              value={type}
              onChange={(e) => {
                setType(e.target.value as ReportType);
                setReport(null);
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            >
              {REPORT_OPTIONS.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, md: 2.5 }}>
            <TextField
              fullWidth
              type="date"
              label="From"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2.5 }}>
            <TextField
              fullWidth
              type="date"
              label="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="solar:chart-2-bold" />}
              disabled={loading}
              onClick={() => setReport(buildReport(type, data?.orders ?? [], data?.products ?? []))}
            >
              Generate
            </Button>
          </Grid>
        </Grid>
      </Card>

      {report && (
        <Card>
          <CardHeader
            title={label}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<Iconify icon="solar:export-bold" />}
                  onClick={() => exportCsv(report, label.replace(/\s+/g, '-').toLowerCase())}
                >
                  Export CSV
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<Iconify icon="solar:printer-bold" />}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </Box>
            }
          />
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset', mt: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {report.columns.map((c) => (
                      <TableCell key={c}>{c}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.rows.map((row, i) => (
                    <TableRow key={i} hover>
                      {row.map((cell, j) => (
                        <TableCell key={j}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {report.rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={report.columns.length} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No data for this report.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
          <Typography variant="caption" sx={{ display: 'block', p: 2, color: 'text.secondary' }}>
            For record-keeping; replaces the manual logbook.
          </Typography>
        </Card>
      )}
    </DashboardContent>
  );
}
