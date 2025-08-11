import { ActionIcon, AppShell, Group, ScrollArea, Space } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Suspense, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { IconMenu2 } from "@tabler/icons-react";
import { ROUTE_HOME, ROUTE_HOME_PLAY_QUEUE } from "../../const/routes";
import { MantineGlobalFilterBox } from "../../features/global_filter/components/MantineGlobalFilterBox";
import { CenterSpinner } from "../../features/loading";
import { MantineBrandLogo } from "../../features/logo/components/MantineBrandLogo";
import { MpdEventObserver } from "../../features/mpd";
import { Player } from "../../features/player";
import {
	PluginExecutionIndicator,
	PluginExecutionModal,
} from "../../features/plugin";
import { MantineMpdProfileSelector } from "../../features/profile/components/MantineMpdProfileSelector";
import { SettingsEntryButton } from "../../features/settings";
import { MantineColorModeSwitchButton } from "../../features/settings/components/MantineColorModeSwitchButton";
import { SideNavigation } from "../../features/side_navigation";
import {
	useIsCompactMode,
	useUserDeviceType,
} from "../../features/user_device";

export function MantineHomeLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const isCompactMode = useIsCompactMode();
	const [isOpen, { toggle }] = useDisclosure(!isCompactMode);
	const userDeviceType = useUserDeviceType();

	useEffect(() => {
		if (location.pathname === ROUTE_HOME) {
			navigate(ROUTE_HOME_PLAY_QUEUE);
		}
	}, [location, navigate]);

	return (
		<>
			<AppShell
				header={{ height: 80 }}
				navbar={{
					width: isOpen ? 250 : 88,
					breakpoint: 0,
					collapsed: { mobile: false, desktop: false },
				}}
				footer={{ height: 100 }}
			>
				<AppShell.Header>
					<Group h="100%" gap={0} wrap="nowrap">
						<Group
							style={{ flexGrow: 1 }}
							maw={userDeviceType === "large" ? 250 : 88}
							miw={userDeviceType === "large" ? 250 : 88}
							justify="center"
							wrap="nowrap"
						>
							<MantineBrandLogo />
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
							<MantineGlobalFilterBox />
							<Group justify="flex-end" wrap="nowrap" gap="md">
								<PluginExecutionIndicator />
								<MantineMpdProfileSelector />
								<MantineColorModeSwitchButton />
								<SettingsEntryButton />
								<Space />
							</Group>
						</Group>
					</Group>
				</AppShell.Header>

				<AppShell.Navbar p={0}>
					<ScrollArea>
						<SideNavigation isCompact={!isOpen} />
					</ScrollArea>
				</AppShell.Navbar>

				<AppShell.Main p={0}>
					<Suspense fallback={<CenterSpinner />}>
						<Outlet />
					</Suspense>
				</AppShell.Main>

				<AppShell.Footer p={0}>
					<Player />
				</AppShell.Footer>
			</AppShell>
			<MpdEventObserver />
			<PluginExecutionModal />
		</>
	);
}
