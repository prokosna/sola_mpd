import {
	ActionIcon,
	useComputedColorScheme,
	useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

/**
 * Light/dark mode toggle button.
 *
 * This component provides an intuitive interface for users to
 * switch between color modes, featuring dynamic icon switching
 * and smooth theme transitions.
 *
 * @component
 * @example
 * ```tsx
 * // In header or settings panel:
 * <ColorModeSwitchButton />
 * ```
 */
export function ColorModeSwitchButton() {
	const { setColorScheme } = useMantineColorScheme();
	const scheme = useComputedColorScheme();

	return (
		<>
			<ActionIcon
				size="md"
				variant="transparent"
				onClick={() => {
					setColorScheme(scheme === "dark" ? "light" : "dark");
				}}
			>
				{scheme === "dark" ? <IconSun /> : <IconMoon />}
			</ActionIcon>
		</>
	);
}
