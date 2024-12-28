import { useMemo } from "react";

import { usePathname } from "../../location";
import { SideNavigationItemProps } from "../components/SideNavigationItem";

/**
 * Custom hook to manage side navigation items.
 *
 * This hook takes an array of base navigation items and enhances them by
 * setting the 'isSelected' property based on the current pathname.
 *
 * @param baseItems - An array of SideNavigationItemProps representing the base navigation items
 * @returns An array of enhanced SideNavigationItemProps with updated 'isSelected' states
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
