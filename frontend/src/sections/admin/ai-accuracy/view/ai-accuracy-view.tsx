import type { Product } from 'src/data/types';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';

import { useAsync } from 'src/hooks/use-async';

import { fetchVisibleProducts } from 'src/services/db';
import { DashboardContent } from 'src/layouts/dashboard';
import { classifyImage, matchProductsByLabels } from 'src/services/ai';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------
// A-x. AI Visual Search — Accuracy Test (Objective 2). Runs the REAL
// client-side MobileNet pipeline (classify → keyword-bridge → match) over a
// labelled set of photos and reports top-1 / top-3 category accuracy, so the
// study has a measured number rather than a claim.
// ----------------------------------------------------------------------

type Row = {
  id: string;
  url: string;
  expectedId: string;
  topLabel?: string;
  matches?: Product[];
  done?: boolean;
};

let counter = 0;

export function AiAccuracyView() {
  const { data } = useAsync(fetchVisibleProducts, []);
  const products = data ?? [];
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const added: Row[] = Array.from(files).map((f) => {
      counter += 1;
      return { id: `img-${counter}`, url: URL.createObjectURL(f), expectedId: '' };
    });
    setRows((r) => [...r, ...added]);
  }, []);

  const setExpected = (id: string, expectedId: string) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, expectedId } : row)));

  const run = useCallback(async () => {
    setRunning(true);
    // Sequential — one classify at a time so the shared model isn't hammered.
    for (const row of rows) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = row.url;
         
        await img.decode();
         
        const preds = await classifyImage(img);
        const matches = matchProductsByLabels(preds, products);
        setRows((cur) =>
          cur.map((r) =>
            r.id === row.id ? { ...r, topLabel: preds[0]?.label ?? '—', matches, done: true } : r
          )
        );
      } catch {
        setRows((cur) =>
          cur.map((r) => (r.id === row.id ? { ...r, topLabel: 'error', matches: [], done: true } : r))
        );
      }
    }
    setRunning(false);
  }, [rows, products]);

  const catOf = (id: string) => products.find((p) => p.id === id)?.category;

  const labeled = rows.filter((r) => r.expectedId && r.done);
  const top1 = labeled.filter((r) => r.matches?.[0]?.category === catOf(r.expectedId)).length;
  const top3 = labeled.filter((r) =>
    r.matches?.slice(0, 3).some((p) => p.category === catOf(r.expectedId))
  ).length;
  const prodTop3 = labeled.filter((r) =>
    r.matches?.slice(0, 3).some((p) => p.id === r.expectedId)
  ).length;
  const pct = (n: number) => (labeled.length ? Math.round((n / labeled.length) * 100) : 0);

  const readyToRun = rows.length > 0 && rows.some((r) => r.expectedId);

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 1 }}>
        AI Visual Search — Accuracy Test
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Add sample product photos, tell the tool which product each one shows, then run the test. It
        runs the real MobileNet visual search and reports how often the correct category is surfaced
        (top-1 and top-3) — use these figures for the study&apos;s accuracy results.
      </Typography>

      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
        <Button variant="outlined" component="label" startIcon={<Iconify icon="solar:gallery-add-bold" />}>
          Add photos
          <input hidden multiple type="file" accept="image/*" onChange={(e) => addFiles(e.target.files)} />
        </Button>
        <Button
          variant="contained"
          disabled={!readyToRun || running}
          startIcon={<Iconify icon="solar:play-bold" />}
          onClick={run}
        >
          {running ? 'Running…' : 'Run accuracy test'}
        </Button>
      </Stack>

      {running && <LinearProgress sx={{ mb: 2 }} />}

      {labeled.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            mb: 3,
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          }}
        >
          <Metric label="Images tested" value={`${labeled.length}`} />
          <Metric label="Top-1 category accuracy" value={`${pct(top1)}%`} color="primary.main" />
          <Metric label="Top-3 category accuracy" value={`${pct(top3)}%`} color="success.main" />
          <Metric label="Exact product in top-3" value={`${pct(prodTop3)}%`} />
        </Box>
      )}

      <Card>
        <CardHeader title="Test images" subheader={rows.length ? undefined : 'No photos added yet.'} />
        <Scrollbar>
          <TableContainer sx={{ mt: 1 }}>
            <Table sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Photo</TableCell>
                  <TableCell>Expected product</TableCell>
                  <TableCell>AI label (MobileNet)</TableCell>
                  <TableCell>Top matches</TableCell>
                  <TableCell align="center">Result</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const ok = !!row.done && row.matches?.[0]?.category === catOf(row.expectedId);
                  const ok3 =
                    !!row.done &&
                    !!row.matches?.slice(0, 3).some((p) => p.category === catOf(row.expectedId));
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Avatar variant="rounded" src={row.url} sx={{ width: 56, height: 56 }} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 200 }}>
                        <Select
                          size="small"
                          fullWidth
                          displayEmpty
                          value={row.expectedId}
                          onChange={(e) => setExpected(row.id, e.target.value)}
                        >
                          <MenuItem value="">
                            <em>Choose…</em>
                          </MenuItem>
                          {products.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{row.topLabel ?? '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 280, color: 'text.secondary' }}>
                        {row.matches?.length
                          ? row.matches.slice(0, 3).map((p) => p.name).join(', ')
                          : row.done
                            ? 'No match'
                            : '—'}
                      </TableCell>
                      <TableCell align="center">
                        {!row.done || !row.expectedId ? (
                          '—'
                        ) : ok ? (
                          <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
                        ) : ok3 ? (
                          <Iconify icon="solar:minus-circle-bold" sx={{ color: 'warning.main' }} />
                        ) : (
                          <Iconify icon="solar:close-circle-bold" sx={{ color: 'error.main' }} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>

      <Alert severity="info" sx={{ mt: 2 }}>
        Result key: ✓ correct category is the top match · ◐ correct category within top-3 · ✗ missed.
        For a meaningful percentage, test 10–20 photos spread across the categories.
      </Alert>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card sx={{ p: 2.5 }}>
      <Typography variant="h3" sx={{ color: color ?? 'text.primary' }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Card>
  );
}
