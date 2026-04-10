import { Text } from "@mantine/core";
import { useUserDeviceType } from "../../user_device";

export function BrandLogo() {
	const userDeviceType = useUserDeviceType();

	if (userDeviceType !== "large") {
		return null;
	}

	return (
		<Text
			pl={24}
			size="28"
			fw={700}
			c="brand"
			style={{
				lineHeight: "100%",
			}}
		>
			Sola MPD
		</Text>
	);
}
