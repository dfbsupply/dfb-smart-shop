import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import InputBase from '@mui/material/InputBase';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Storefront nav search — type to search the catalog, or tap the camera
// to open the Visual Search page (search by photo).
// ----------------------------------------------------------------------

export function StoreSearchbar() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    const q = query.trim();
    router.push(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog');
  };

  return (
    <Box
      sx={{
        height: 40,
        width: '100%',
        maxWidth: 360,
        display: 'flex',
        alignItems: 'center',
        pl: 1.5,
        pr: 0.5,
        borderRadius: 1,
        bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
        border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
        transition: theme.transitions.create(['border-color']),
        '&:focus-within': { borderColor: 'primary.main' },
      }}
    >
      <Iconify icon="eva:search-fill" width={20} sx={{ color: 'text.disabled', mr: 1 }} />

      <InputBase
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSearch();
        }}
        placeholder={t('search.placeholder')}
        sx={{ flexGrow: 1, fontSize: 14 }}
      />

      <Divider orientation="vertical" flexItem sx={{ my: 1, borderStyle: 'dashed' }} />

      <Tooltip title={t('search.byPhoto')}>
        <IconButton onClick={() => router.push('/visual-search')} size="small">
          <Iconify icon="solar:camera-bold" width={20} sx={{ color: 'primary.main' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
