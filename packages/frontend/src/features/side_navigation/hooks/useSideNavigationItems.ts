import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { pathnameAtom } from "../../location/states/atoms/locationAtom";
import type { SideNavigationItemProps } from "../components/SideNavigationItem";

export function useSideNavigationItems(
	baseItems: SideNavigationItemProps[],
): SideNavigationItemProps[] {
	const pathname = useAtomValue(pathnameAtom);

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
