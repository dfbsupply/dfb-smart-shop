import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------
// W-8. About Page.
// ----------------------------------------------------------------------

export function StoreAboutView() {
  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h3" sx={{ mb: 3 }}>
        About New DFB Glass &amp; Aluminum
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
        New DFB Glass &amp; Aluminum has installed glass and aluminum materials since 2019, based on
        Felix Y. Manalo St., San Isidro, Cainta, Rizal. We bring custom glass and aluminum supply
        online — with instant pricing and smart product search — so you can plan your project
        anytime.
      </Typography>

      <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Why we built DFB Smart Shop
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          The shop used to track stock and orders by hand. DFB Smart Shop replaces the logbook with
          a real-time system: customers get instant, measurement-based quotes and can find parts by
          photo, while the shop manages inventory, orders, and reservations from one dashboard.
        </Typography>
      </Card>
    </Box>
  );
}
