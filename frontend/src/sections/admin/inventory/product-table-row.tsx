import type { Product } from 'src/data/types';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Switch from '@mui/material/Switch';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { useRouter } from 'src/routes/hooks';

import { fPeso } from 'src/data/pricing';
import { getStockStatus, STOCK_STATUS_LABEL, STOCK_STATUS_COLOR } from 'src/data/status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: Product;
  onToggleVisible: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ProductTableRow({ row, onToggleVisible, onDelete }: Props) {
  const router = useRouter();
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleClose = useCallback(() => setOpenPopover(null), []);

  const stockStatus = getStockStatus(row);

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar variant="rounded" src={row.images[0]} alt={row.name} sx={{ width: 48, height: 48 }} />
            <Typography variant="subtitle2" noWrap>
              {row.name}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>{row.category}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fPeso(row.basePrice)}</TableCell>

        <TableCell align="center">{row.stockQty}</TableCell>

        <TableCell>
          <Label color={STOCK_STATUS_COLOR[stockStatus]}>{STOCK_STATUS_LABEL[stockStatus]}</Label>
        </TableCell>

        <TableCell align="center">
          <Switch
            checked={row.visibleInShop}
            onChange={() => onToggleVisible(row.id)}
            inputProps={{ 'aria-label': 'Visible in shop' }}
          />
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={(e) => setOpenPopover(e.currentTarget)}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: { px: 1, gap: 2, borderRadius: 0.75 },
          }}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              router.push(`/admin/inventory/${row.id}/edit`);
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              onDelete(row.id);
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
