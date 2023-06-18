import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { NavItemProps } from "../components/SideNav";
import { useAppStore } from "../store/AppStore";

export function useSideNav(baseItems: NavItemProps[]) {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const updateSelectedSongs = useAppStore((state) => state.updateSelectedSongs);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      // Reset selected songs on a page transition
      updateSelectedSongs([]);
      prevPathnameRef.current = pathname;
    }
  }, [pathname, updateSelectedSongs]);

  const navItems = useMemo(() => {
    return baseItems.map((v) => {
      if (v.link === pathname) {
        v.isSelected = true;
      }
      return v;
    });
  }, [baseItems, pathname]);

  return {
    navItems,
  };
}
