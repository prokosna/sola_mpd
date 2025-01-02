import { useMemo } from "react";

import { usePathname } from "../../location";
import { SideNavigationItemProps } from "../components/SideNavigationItem";

/**
 * Update navigation items' selection state based on URL.
 *
 * @param baseItems Navigation items
 * @returns Items with updated selection states
 */
export function useSideNavigationItems(
  baseItems: SideNavigationItemProps[],
): SideNavigationItemProps[] {
  const pathname = usePathname();

  const navItems = useMemo(() => {
    return baseItems.map((item) => {
      if (item.link === pathname) {
        item.isSelected = true;
      } else {
        item.isSelected = false;
      }
      return item;
    });
  }, [baseItems, pathname]);

  return navItems;
}
