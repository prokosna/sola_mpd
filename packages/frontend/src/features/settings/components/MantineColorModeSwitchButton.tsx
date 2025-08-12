import { useColorMode } from "@chakra-ui/react";
import { ActionIcon, useMantineColorScheme } from "@mantine/core";
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
export function MantineColorModeSwitchButton() {
	const { setColorMode } = useColorMode(); // TODO: To be removed
	const { colorScheme, setColorScheme } = useMantineColorScheme();

	return (
		<>
			<ActionIcon
				size="md"
				variant="transparent"
				onClick={() => {
					setColorScheme(colorScheme === "dark" ? "light" : "dark");
					setColorMode(colorScheme === "dark" ? "light" : "dark");
				}}
			>
				{colorScheme === "dark" ? <IconSun /> : <IconMoon />}
			</ActionIcon>
		</>
	);
}
