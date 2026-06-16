import type { Order, OrderStatus } from 'src/data/types';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { fPeso } from 'src/data/pricing';
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_OPTIONS,
} from 'src/data/status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
};

export function OrderTableRow({ row, onStatusChange }: Props) {
  const itemCount = row.items.reduce((n, i) => n + i.qty, 0);
  const summary = row.items.map((i) => i.name).join(', ');

  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 'fontWeightSemiBold', whiteSpace: 'nowrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {row.code}
          {row.source === 'visual_search' && (
            <Iconify
              icon="solar:camera-bold"
              width={16}
              sx={{ color: 'info.main' }}
            />
          )}
        </Box>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {row.customerName}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {row.customerMobile}
        </Typography>
      </TableCell>

      <TableCell sx={{ maxWidth: 220 }}>
        <Typography variant="body2">{itemCount} item(s)</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
          {summary}
        </Typography>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fPeso(row.estTotal)}</TableCell>

      <TableCell>
        <Label color={row.type === 'reservation' ? 'secondary' : 'default'}>
          {row.type === 'reservation' ? 'Reservation' : 'Order'}
        </Label>
      </TableCell>

      <TableCell sx={{ textTransform: 'capitalize' }}>
        {row.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}
      </TableCell>

      <TableCell>
        <Select
          size="small"
          value={row.status}
          onChange={(e) => onStatusChange(row.id, e.target.value as OrderStatus)}
          renderValue={(value) => (
            <Label color={ORDER_STATUS_COLOR[value as OrderStatus]}>
              {ORDER_STATUS_LABEL[value as OrderStatus]}
            </Label>
          )}
          sx={{
            minWidth: 150,
            '& .MuiSelect-select': { py: 0.75 },
          }}
        >
          {ORDER_STATUS_OPTIONS.map((status) => (
            <MenuItem key={status} value={status}>
              {ORDER_STATUS_LABEL[status]}
            </MenuItem>
          ))}
        </Select>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.createdAt)}</TableCell>

      <TableCell align="right">
        <Box>
          <Button component={RouterLink} href={`/admin/orders/${row.id}`} size="small" color="inherit">
            View
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );
}
