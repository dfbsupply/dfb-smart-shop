import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import { useRouter, usePathname } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Buyer (client) mobile app shell — a centered phone-style frame with an
// optional bottom navigation. Used for all signed-in buyer pages.
// ----------------------------------------------------------------------

const NAV_ITEMS = [
  { label: 'Home', value: '/buyer', icon: 'solar:home-2-bold-duotone' },
  { label: 'Orders', value: '/buyer/orders', icon: 'solar:bag-3-bold-duotone' },
  { label: 'Alerts', value: '/buyer/notifications', icon: 'solar:bell-bing-bold-duotone' },
  { label: 'Profile', value: '/buyer/profile', icon: 'solar:user-circle-bold-duotone' },
];

type Props = {
  children: React.ReactNode;
  hideBottomNav?: boolean;
};

export function BuyerLayout({ children, hideBottomNav }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Highlight the deepest matching nav item.
  const activeValue =
    NAV_ITEMS.filter((item) => pathname === item.value || pathname.startsWith(`${item.value}/`))
      .sort((a, b) => b.value.length - a.value.length)[0]?.value ?? false;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        bgcolor: theme.vars.palette.background.neutral,
      }}
    >
      <Box
        sx={{
          width: 1,
          maxWidth: 480,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          bgcolor: 'background.default',
          boxShadow: { sm: theme.vars.customShadows.z16 },
        }}
      >
        <Box
          sx={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            px: 2,
            pt: 2,
            pb: hideBottomNav ? 2 : 12,
          }}
        >
          {children}
        </Box>

        {!hideBottomNav && (
          <Paper
            elevation={0}
            sx={{
              left: 0,
              right: 0,
              bottom: 0,
              position: 'sticky',
              borderTop: `1px solid ${theme.vars.palette.divider}`,
            }}
          >
            <BottomNavigation
              showLabels
              value={activeValue}
              onChange={(_, value) => router.push(value)}
            >
              {NAV_ITEMS.map((item) => (
                <BottomNavigationAction
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  icon={<Iconify icon={item.icon} width={24} />}
                />
              ))}
            </BottomNavigation>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
