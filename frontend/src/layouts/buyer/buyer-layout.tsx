import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import { RouterLink } from 'src/routes/components';
import { useRouter, usePathname } from 'src/routes/hooks';

import { useUnreadNotifications } from 'src/hooks/use-unread-notifications';

import { useAuth } from 'src/auth';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Buyer (client) app shell — responsive.
//   • Desktop (md+): a persistent left sidebar with navigation + a full-width
//     content area, like a proper web dashboard.
//   • Mobile (< md): full-width content with a sticky bottom navigation bar,
//     the familiar phone-app feel.
// `hideBottomNav` is used by the auth pages (sign-in / register / reset),
// which render a clean, centered single column with no navigation.
// ----------------------------------------------------------------------

const SIDEBAR_WIDTH = 260;

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
  const { user, profile, requestSignOut } = useAuth();
  const unread = useUnreadNotifications(user?.id);

  // Highlight the deepest matching nav item.
  const activeValue =
    NAV_ITEMS.filter((item) => pathname === item.value || pathname.startsWith(`${item.value}/`)).sort(
      (a, b) => b.value.length - a.value.length
    )[0]?.value ?? false;

  // Nav icon, badged with the live unread count on the Alerts item.
  const navIcon = (item: (typeof NAV_ITEMS)[number]) => {
    const icon = <Iconify icon={item.icon} width={24} />;
    if (item.value === '/buyer/notifications' && unread > 0) {
      return (
        <Badge badgeContent={unread} color="error">
          {icon}
        </Badge>
      );
    }
    return icon;
  };

  // ----- Auth pages: clean, centered single column (no navigation) ----------
  if (hideBottomNav) {
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
            px: 2,
            pt: 2,
            pb: 2,
            bgcolor: 'background.default',
            boxShadow: { sm: theme.vars.customShadows.z16 },
          }}
        >
          {children}
        </Box>
      </Box>
    );
  }

  // ----- Desktop sidebar ----------------------------------------------------
  const firstName = profile?.full_name?.trim().split(' ')[0] || 'Account';
  const sidebar = (
    <Box
      component="nav"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        bgcolor: 'background.default',
        borderRight: `1px solid ${theme.vars.palette.divider}`,
      }}
    >
      <Box sx={{ px: 2.5, py: 3 }}>
        <Logo isSingle={false} href="/buyer" />
      </Box>

      <List sx={{ px: 2, flex: '1 1 auto' }}>
        {NAV_ITEMS.map((item) => {
          const selected = activeValue === item.value;
          return (
            <ListItemButton
              key={item.value}
              selected={selected}
              onClick={() => router.push(item.value)}
              sx={{
                mb: 0.5,
                borderRadius: 1,
                color: selected ? 'primary.main' : 'text.secondary',
                fontWeight: selected ? 600 : 500,
              }}
            >
              <Box sx={{ mr: 2, display: 'inline-flex' }}>{navIcon(item)}</Box>
              <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                {item.label}
              </Typography>
            </ListItemButton>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 15 }}>
          {firstName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {firstName}
          </Typography>
          <Typography
            component={RouterLink}
            href="/"
            variant="caption"
            sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Back to shop
          </Typography>
        </Box>
        <Iconify
          icon="solar:logout-2-bold-duotone"
          width={22}
          onClick={requestSignOut}
          sx={{ cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'error.main' } }}
        />
      </Box>
    </Box>
  );

  // ----- Mobile bottom navigation ------------------------------------------
  const bottomNav = (
    <Paper
      elevation={0}
      sx={{
        left: 0,
        right: 0,
        bottom: 0,
        position: 'sticky',
        display: { xs: 'block', md: 'none' },
        borderTop: `1px solid ${theme.vars.palette.divider}`,
      }}
    >
      <BottomNavigation showLabels value={activeValue} onChange={(_, value) => router.push(value)}>
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={navIcon(item)}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: { xs: 'background.default', md: theme.vars.palette.background.neutral },
      }}
    >
      {sidebar}

      {/* Content column */}
      <Box sx={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          component="main"
          sx={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            width: 1,
            mx: 'auto',
            maxWidth: { xs: 480, md: 1100 },
            px: { xs: 2, md: 4 },
            pt: { xs: 2, md: 4 },
            pb: { xs: 2, md: 4 },
          }}
        >
          {children}
        </Box>

        {bottomNav}
      </Box>
    </Box>
  );
}
