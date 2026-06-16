import type { Product } from 'src/data/types';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';

import { DashboardContent } from 'src/layouts/dashboard';
import { PRODUCTS, RECOMMENDATIONS } from 'src/data/mock';

import { useToast } from 'src/components/toast';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------
// A-8. Smart Recommendations Setup — admin-curated "Frequently Bought Together".
// ----------------------------------------------------------------------

export function RecommendationsView() {
  const { showToast, toast } = useToast();

  const initial: Record<string, string[]> = Object.fromEntries(
    PRODUCTS.map((p) => [
      p.id,
      RECOMMENDATIONS.find((r) => r.productId === p.id)?.addonIds ?? [],
    ])
  );

  const [pairings, setPairings] = useState<Record<string, string[]>>(initial);

  const productById = (id: string) => PRODUCTS.find((p) => p.id === id)!;

  const handleSave = () => showToast('Pairings saved.');

  return (
    <DashboardContent>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4">Recommendations</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Set which complementary items are suggested with each product (e.g., a window lock with
            a window frame).
          </Typography>
        </Box>
        <Button variant="contained" color="inherit" onClick={handleSave}>
          Save Pairings
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        These suggestions appear on the product page and in the cart as “Frequently Bought
        Together.”
      </Alert>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '35%' }}>Product</TableCell>
                  <TableCell>Recommended Add-ons</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {PRODUCTS.map((product) => {
                  const selected = pairings[product.id].map(productById);
                  const options = PRODUCTS.filter((p) => p.id !== product.id);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            variant="rounded"
                            src={product.images[0]}
                            alt={product.name}
                            sx={{ width: 44, height: 44 }}
                          />
                          <Box>
                            <Typography variant="subtitle2">{product.name}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {product.category}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Autocomplete
                          multiple
                          size="small"
                          options={options}
                          value={selected}
                          getOptionLabel={(o: Product) => o.name}
                          isOptionEqualToValue={(o, v) => o.id === v.id}
                          onChange={(_, value) =>
                            setPairings((prev) => ({
                              ...prev,
                              [product.id]: value.map((v) => v.id),
                            }))
                          }
                          renderInput={(params) => (
                            <TextField {...params} placeholder="Select add-ons…" />
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>

      {toast}
    </DashboardContent>
  );
}
