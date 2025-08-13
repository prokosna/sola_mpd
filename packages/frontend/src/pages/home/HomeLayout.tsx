import {
	ActionIcon,
	AppShell,
	Box,
	Group,
	ScrollArea,
	Space,
	useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Suspense, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { IconMenu2 } from "@tabler/icons-react";
import { ROUTE_HOME, ROUTE_HOME_PLAY_QUEUE } from "../../const/routes";
import { GlobalFilterBox } from "../../features/global_filter";
import { CenterSpinner } from "../../features/loading";
import { BrandLogo } from "../../features/logo";
import { MpdEventObserver } from "../../features/mpd";
import { Player } from "../../features/player";
import {
	PluginExecutionIndicator,
	PluginExecutionModal,
} from "../../features/plugin";
import { MpdProfileSelector } from "../../features/profile";
import {
	ColorModeSwitchButton,
	SettingsEntryButton,
} from "../../features/settings";
import { SideNavigation } from "../../features/side_navigation";
import {
	useIsCompactMode,
	useUserDeviceType,
} from "../../features/user_device";

export function HomeLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const isCompactMode = useIsCompactMode();
	const [isOpen, { toggle }] = useDisclosure(!isCompactMode);
	const userDeviceType = useUserDeviceType();
	const scheme = useMantineColorScheme();

	useEffect(() => {
		if (location.pathname === ROUTE_HOME) {
			navigate(ROUTE_HOME_PLAY_QUEUE);
		}
	}, [location, navigate]);

	return (
		<>
			<AppShell
				header={{ height: 60 }}
				navbar={{
					width: isOpen ? 220 : 69,
					breakpoint: 0,
					collapsed: { mobile: false, desktop: false },
				}}
				footer={{ height: 100 }}
			>
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
							<Space />
							<ActionIcon size="md" variant="transparent" onClick={toggle}>
								<IconMenu2 />
							</ActionIcon>
							<Space />
						</Group>
						<Group
							style={{ flexGrow: 1 }}
							justify="space-between"
							wrap="nowrap"
						>
							<GlobalFilterBox />
							<Group justify="flex-end" wrap="nowrap" gap="md">
								<PluginExecutionIndicator />
								<MpdProfileSelector />
								<ColorModeSwitchButton />
								<SettingsEntryButton />
								<Space />
							</Group>
						</Group>
					</Group>
				</AppShell.Header>

				<AppShell.Navbar>
					<ScrollArea>
						<SideNavigation isCompact={!isOpen} />
					</ScrollArea>
				</AppShell.Navbar>

				<AppShell.Main
					display="flex"
					bg={scheme.colorScheme === "dark" ? "dark.7" : "white"}
				>
					<Suspense fallback={<CenterSpinner />}>
						<Box flex={1}>
							<Outlet />
						</Box>
					</Suspense>
				</AppShell.Main>

				<AppShell.Footer
					bg={scheme.colorScheme === "dark" ? "brand.9" : "brand.1"}
				>
					<Player />
				</AppShell.Footer>
			</AppShell>
			<MpdEventObserver />
			<PluginExecutionModal />
		</>
	);
}
