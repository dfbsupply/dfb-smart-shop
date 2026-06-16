import { Iconify } from 'src/components/iconify';

import type { AccountPopoverProps } from './components/account-popover';

// ----------------------------------------------------------------------

export const _account: AccountPopoverProps['data'] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: <Iconify width={22} icon="solar:cart-large-2-bold-duotone" />,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: <Iconify width={22} icon="solar:settings-bold-duotone" />,
  },
];
