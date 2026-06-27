import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------
// DFB Smart Shop logo. `isSingle` (default) renders just the green "DFB"
// oval mark — modelled on the DFB Glass & Aluminum Supply business card;
// otherwise it adds the "DFB Smart Shop" wordmark beside it.
// ----------------------------------------------------------------------

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
          width: isSingle ? 58 : 'auto',
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        {/* Green "DFB" oval — mirrors the logo on the business card. */}
        <Box
          sx={{
            width: 58,
            height: 40,
            flexShrink: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'common.white',
            fontWeight: 800,
            fontSize: 17,
            fontStyle: 'italic',
            letterSpacing: '0.5px',
            fontFamily: "Georgia, 'Times New Roman', serif",
            textShadow: '0 1px 1px rgba(0,0,0,0.35)',
            background: (theme) =>
              `linear-gradient(160deg, ${theme.vars.palette.primary.light} 0%, ${theme.vars.palette.primary.main} 55%, ${theme.vars.palette.primary.darker} 100%)`,
            boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.45)',
          }}
        >
          DFB
        </Box>
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
