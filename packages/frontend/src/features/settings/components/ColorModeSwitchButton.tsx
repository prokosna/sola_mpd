import {
	ActionIcon,
	useComputedColorScheme,
	useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ColorModeSwitchButton() {
	const { setColorScheme } = useMantineColorScheme();
	const scheme = useComputedColorScheme();

	return (
		<ActionIcon
			size="md"
			variant="transparent"
			onClick={() => {
				setColorScheme(scheme === "dark" ? "light" : "dark");
			}}
		>
			{scheme === "dark" ? <IconSun /> : <IconMoon />}
		</ActionIcon>
	);
}
