import {
	AppShell,
	Box,
	Group,
	Title,
	useComputedColorScheme,
} from "@mantine/core";
import { useRouteError } from "react-router";
import { BrandLogo } from "../../features/logo";
import { useUserDeviceType } from "../../features/user_device";

export function HomeErrorPage() {
	const error = useRouteError() as Error;
	const userDeviceType = useUserDeviceType();
	const scheme = useComputedColorScheme();
	console.error(error);

	return (
		<AppShell header={{ height: 60 }}>
			<AppShell.Header>
				<Group h="100%" gap={0} wrap="nowrap">
					<Group
						maw={userDeviceType === "large" ? 220 : 69}
						miw={userDeviceType === "large" ? 220 : 69}
						justify="space-between"
						wrap="nowrap"
						gap={0}
					>
						<BrandLogo />
					</Group>
					<Group style={{ flexGrow: 1 }} justify="space-between" wrap="nowrap">
						<Group justify="flex-end" wrap="nowrap" gap="md"></Group>
					</Group>
				</Group>
			</AppShell.Header>

			<AppShell.Main display="flex" bg={scheme === "dark" ? "dark.7" : "white"}>
				<Box p={12}>
					<Title>Oops!@HomeError</Title>
					<p>
						Something went wrong. Please make sure that your MPD server is
						running and try reloading the page.
					</p>
					<p>
						<i>Error: {error.message}</i>
					</p>
				</Box>
			</AppShell.Main>
		</AppShell>
	);
}
