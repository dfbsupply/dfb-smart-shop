import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import { LANGS } from 'src/locales/i18n';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      i18n.changeLanguage(value);
      setAnchorEl(null);
    },
    [i18n]
  );

  return (
    <>
      <Tooltip title={t('language.label')}>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label={t('language.label')}>
          <Iconify icon="solar:global-linear" width={24} />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        {LANGS.map((lang) => (
          <MenuItem
            key={lang.value}
            selected={i18n.resolvedLanguage === lang.value}
            onClick={() => handleChange(lang.value)}
          >
            {lang.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
