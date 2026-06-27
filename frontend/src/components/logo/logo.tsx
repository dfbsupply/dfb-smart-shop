import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------
// DFB Smart Shop logo. Renders the actual DFB logo image from /public.
// `isSingle` (default) shows just the logo mark; otherwise it adds the
// "DFB Smart Shop" wordmark beside it.
// ----------------------------------------------------------------------

// The DFB oval logo lives in /public (same artwork as the favicon set).
const LOGO_SRC = '/apple-touch-icon.png';

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="DFB Smart Shop"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          height: 40,
          width: isSingle ? 40 : 'auto',
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          component="img"
          src={LOGO_SRC}
          alt="DFB"
          sx={{ width: 40, height: 40, flexShrink: 0, objectFit: 'contain' }}
        />
        {!isSingle && (
          <Box
            component="span"
            sx={{
              fontWeight: 800,
              fontSize: 18,
              whiteSpace: 'nowrap',
              color: 'text.primary',
            }}
          >
            DFB Smart Shop
          </Box>
        )}
      </Box>
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
