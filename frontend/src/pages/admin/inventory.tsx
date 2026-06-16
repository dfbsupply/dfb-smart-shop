import { CONFIG } from 'src/config-global';

import { InventoryView } from 'src/sections/admin/inventory/view/inventory-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Inventory - ${CONFIG.appName}`}</title>

      <InventoryView />
    </>
  );
}
