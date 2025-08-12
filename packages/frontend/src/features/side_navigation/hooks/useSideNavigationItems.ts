import { useMemo } from "react";

import { usePathname } from "../../location";
import type { SideNavigationItemProps } from "../components/MantineSideNavigationItem";

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
			if (item.link === pathname.replace("mantine", "home")) {
				// TODO: reomve later
				item.isSelected = true;
			} else {
				item.isSelected = false;
			}
			return item;
		});
	}, [baseItems, pathname]);

	return navItems;
}
