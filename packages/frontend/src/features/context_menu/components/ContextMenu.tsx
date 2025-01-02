import { useColorMode } from "@chakra-ui/react";
import {
	Item,
	type ItemParams,
	Menu,
	Separator,
	Submenu,
} from "react-contexify";

import type { ContextMenuProps } from "../types/contextMenuTypes";

/**
 * A flexible context menu component with support for nested sections and items.
 *
 * Features:
 * - Multiple menu sections with separators
 * - Nested submenu support
 * - Custom click handlers per item
 * - Theme-aware styling
 * - Generic data type support
 *
 * @template T - Type of data passed to click handlers
 * @param props - Component properties
 * @param props.sections - Array of menu sections
 * @param props.sections[].items - Array of menu items in each section
 * @param props.sections[].items[].name - Display name of the menu item
 * @param props.sections[].items[].onClick - Click handler for the menu item
 * @param props.sections[].items[].subItems - Optional nested menu items
 * @returns Rendered context menu component
 */
export function ContextMenu<T>(props: ContextMenuProps<T>) {
	const { colorMode } = useColorMode();

	function handleClick(params: ItemParams<T, unknown>) {
		for (const section of props.sections) {
			for (const item of section.items) {
				if (item.name === params.id) {
					item.onClick?.(params?.props);
				}
				if (item.subItems === undefined) {
					continue;
				}
				for (const subItem of item.subItems) {
					if (subItem.name === params.id) {
						subItem.onClick(params?.props);
					}
				}
			}
		}
	}

	const items = props.sections
		.map((section) =>
			section.items.map((item) =>
				item.subItems === undefined ? (
					<Item key={item.name} id={item.name} onClick={handleClick}>
						{item.name}
					</Item>
				) : (
					<Submenu key={item.name} label={item.name}>
						{item.subItems.map((subItem) => (
							<Item key={subItem.name} id={subItem.name} onClick={handleClick}>
								{subItem.name}
							</Item>
						))}
					</Submenu>
				),
			),
		)
		.reduce(
			// biome-ignore lint/suspicious/noArrayIndexKey: Order is fixed.
			(prev, curr, index) => prev.concat(...curr, [<Separator key={index} />]),
			[],
		)
		.slice(0, -1);

	return (
		<>
			<Menu id={props.id} animation={"scale"} theme={colorMode}>
				{items}
			</Menu>
		</>
	);
}
