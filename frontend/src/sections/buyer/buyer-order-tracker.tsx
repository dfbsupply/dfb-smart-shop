import type { Order, OrderStatus } from 'src/data/types';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// B-5/B-6. Order status tracker — a 4-stage timeline of the shop-set status
// (no courier tracking). Reservations use reservation-flavoured labels.
// ----------------------------------------------------------------------

const ORDER_STEPS = ['Placed', 'Confirmed', 'Ready for Pickup', 'Completed'];
const RESERVATION_STEPS = ['Reserved', 'Confirmed', 'Ready', 'Released'];

// Map each status onto a step index in the flow above.
const STEP_INDEX: Record<OrderStatus, number> = {
  new: 0,
  pending: 0,
  confirmed: 1,
  ready: 2,
  completed: 3,
  cancelled: 0,
};

export function BuyerOrderTracker({ order }: { order: Order }) {
  const isReservation = order.type === 'reservation';
  const steps = isReservation ? RESERVATION_STEPS : ORDER_STEPS;

  if (order.status === 'cancelled') {
    return (
      <Card
        sx={{
          p: 2.5,
          mb: 2,
          gap: 1.5,
          display: 'flex',
          alignItems: 'center',
          bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
        }}
      >
        <Iconify icon="solar:close-circle-bold" width={28} sx={{ color: 'error.main' }} />
        <Box>
          <Typography variant="subtitle2">
            {isReservation ? 'Reservation cancelled' : 'Order cancelled'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            This {isReservation ? 'reservation has expired or was' : 'order was'} cancelled. Contact
            the shop if this is unexpected.
          </Typography>
        </Box>
      </Card>
    );
  }

  // When completed, mark every step done; otherwise the current status is active.
  const activeStep = order.status === 'completed' ? steps.length : STEP_INDEX[order.status];

  return (
    <Card sx={{ p: 2.5, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2.5 }}>
        Order Status
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              slotProps={{ label: { sx: { typography: 'caption', mt: 0.5 } } }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Card>
  );
}
