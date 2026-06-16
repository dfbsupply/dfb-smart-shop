import type { SelectChangeEvent } from '@mui/material/Select';
import type { Product, StockStatus, ProductCategory } from 'src/data/types';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';

import { RouterLink } from 'src/routes/components';

import { PRODUCTS } from 'src/data/mock';
import { getStockStatus } from 'src/data/status';
import { PRODUCT_CATEGORIES } from 'src/data/types';
import { DashboardContent } from 'src/layouts/dashboard';

import { useToast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { ProductTableRow } from '../product-table-row';

// ----------------------------------------------------------------------
// A-5. Inventory Management — Product List (manage stock of materials).
// ----------------------------------------------------------------------

export function InventoryView() {
  const { showToast, toast } = useToast();

  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [stock, setStock] = useState<StockStatus | 'all'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleToggleVisible = useCallback(
    (id: string) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, visibleInShop: !p.visibleInShop } : p))
      );
    },
    []
  );

  const handleConfirmDelete = useCallback(() => {
    setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    showToast('Product deleted.', 'warning');
  }, [deleteId, showToast]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch = !query || p.name.toLowerCase().includes(query);
      const matchCategory = category === 'all' || p.category === category;
      const matchStock = stock === 'all' || getStockStatus(p) === stock;
      return matchSearch && matchCategory && matchStock;
    });
  }, [products, search, category, stock]);

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Inventory
        </Typography>
        <Button
          component={RouterLink}
          href="/admin/inventory/new"
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          Add Product
        </Button>
      </Box>

      <Card>
        <Box
          sx={{
            p: 2.5,
            gap: 2,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            sx={{ flexGrow: 1, minWidth: 220 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Select
            size="small"
            value={category}
            onChange={(e: SelectChangeEvent) => setCategory(e.target.value as ProductCategory | 'all')}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All categories</MenuItem>
            {PRODUCT_CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
          <Select
            size="small"
            value={stock}
            onChange={(e: SelectChangeEvent) => setStock(e.target.value as StockStatus | 'all')}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All stock</MenuItem>
            <MenuItem value="in_stock">In Stock</MenuItem>
            <MenuItem value="low_stock">Low Stock</MenuItem>
            <MenuItem value="out_of_stock">Out of Stock</MenuItem>
          </Select>
        </Box>

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 820 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Base Price</TableCell>
                  <TableCell align="center">Stock Qty</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Visible in Shop</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((product) => (
                  <ProductTableRow
                    key={product.id}
                    row={product}
                    onToggleVisible={handleToggleVisible}
                    onDelete={setDeleteId}
                  />
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        {products.length === 0 ? 'No products yet.' : 'No products match your filters.'}
                      </Typography>
                      {products.length === 0 && (
                        <Button
                          component={RouterLink}
                          href="/admin/inventory/new"
                          variant="contained"
                          color="inherit"
                        >
                          Add Your First Product
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete this item?"
        content="This can't be undone."
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />

      {toast}
    </DashboardContent>
  );
}
