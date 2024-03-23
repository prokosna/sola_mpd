import { useMemo } from "react";

import { usePathname } from "../../location";
import { SideNavigationItemProps } from "../components/SideNavigationItem";

export function useSideNavigationItems(baseItems: SideNavigationItemProps[]) {
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
