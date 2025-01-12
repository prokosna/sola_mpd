import {
	Box,
	Button,
	Flex,
	Grid,
	GridItem,
	HStack,
	Icon,
	Spacer,
	useDisclosure,
} from "@chakra-ui/react";
import { Suspense, useEffect } from "react";
import { IoMenu } from "react-icons/io5";
import { Outlet, useLocation, useNavigate } from "react-router";

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
	const { getButtonProps, isOpen } = useDisclosure({
		defaultIsOpen: !isCompactMode,
	});
	const userDeviceType = useUserDeviceType();

	useEffect(() => {
		if (location.pathname === ROUTE_HOME) {
			navigate(ROUTE_HOME_PLAY_QUEUE);
		}
	}, [location, navigate]);

	return (
		<>
			<Grid
				templateAreas={`"header"
      "main"
      "footer"`}
				gridTemplateRows={"80px 1fr 100px"}
				maxH="100dvh"
				gap="0px"
			>
				<GridItem area={"header"}>
					<HStack spacing={"0px"}>
						<Box minW={userDeviceType === "large" ? "250px" : "88px"} h="80px">
							<HStack h="100%" justify={"space-between"} align={"center"}>
								<BrandLogo />
								<Button
									{...getButtonProps()}
									p={0}
									ml={userDeviceType === "large" ? 0 : 2}
									mr={2}
									variant={"ghost"}
									flexGrow={1}
								>
									<Icon as={IoMenu} fontSize={24} />
								</Button>
							</HStack>
						</Box>
						<Box flexGrow={"1"}>
							<HStack h="100%" justify={"space-between"} align={"center"}>
								<GlobalFilterBox />
								<HStack h="100%" justify={"end"} align={"center"}>
									<PluginExecutionIndicator />
									<Spacer />
									<MpdProfileSelector />
									<Spacer />
									<ColorModeSwitchButton />
									<SettingsEntryButton />
									<Spacer />
								</HStack>
							</HStack>
						</Box>
					</HStack>
				</GridItem>
				<GridItem area={"main"}>
					<Flex h="calc(100dvh - 180px)" w="100vw">
						<Box
							className="layout-border-top layout-border-bottom"
							overflowX={"clip"}
							overflowY={"auto"}
							minW={isOpen ? "250px" : "20px"}
						>
							<SideNavigation {...{ isCompact: !isOpen }} />
						</Box>
						<Box flexGrow={"1"} overflowY={"auto"}>
							<Suspense
								fallback={
									<CenterSpinner className="layout-border-top layout-border-left" />
								}
							>
								<Outlet />
							</Suspense>
						</Box>
					</Flex>
				</GridItem>
				<GridItem area={"footer"}>
					<Player />
				</GridItem>
			</Grid>
			<MpdEventObserver />
			<PluginExecutionModal />
		</>
	);
}
