import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

const icon = (name: string) => <Iconify width={24} icon={name} />;

export const navData: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/admin',
    icon: icon('solar:chart-2-bold-duotone'),
  },
  {
    title: 'Orders',
    path: '/admin/orders',
    icon: icon('solar:cart-large-2-bold-duotone'),
  },
  {
    title: 'Inventory',
    path: '/admin/inventory',
    icon: icon('solar:box-bold-duotone'),
  },
  {
    title: 'Promo Banners',
    path: '/admin/promos',
    icon: icon('solar:gallery-wide-bold-duotone'),
  },
  {
    title: 'Recommendations',
    path: '/admin/recommendations',
    icon: icon('solar:magic-stick-3-bold-duotone'),
  },
  {
    title: 'Reports',
    path: '/admin/reports',
    icon: icon('solar:chart-square-bold-duotone'),
  },
  {
    title: 'Settings',
    path: '/admin/settings',
    icon: icon('solar:settings-bold-duotone'),
  },
];
