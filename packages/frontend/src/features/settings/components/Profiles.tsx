import {
	Button,
	Divider,
	Modal,
	ModalBody,
	ModalContent,
	ModalOverlay,
	Table,
	TableContainer,
	Tbody,
	Th,
	Thead,
	Tr,
	VStack,
	useDisclosure,
} from "@chakra-ui/react";

import { CenterSpinner } from "../../loading";
import { MpdProfileForm, useMpdProfileState } from "../../profile";

import { ProfilesProfile } from "./ProfilesProfile";

/**
 * MPD profiles management interface.
 *
 * Displays a table of MPD connection profiles with options
 * to add, edit, and delete profiles.
 */
export function Profiles() {
	const mpdProfileState = useMpdProfileState();
	const { isOpen, onOpen, onClose } = useDisclosure();

	if (mpdProfileState === undefined) {
		return <CenterSpinner className="layout-border-top layout-border-left" />;
	}

	return (
		<>
			<VStack spacing={"12px"} align={"start"}>
				<Button onClick={onOpen}>Add</Button>
				<Divider />
				<TableContainer>
					<Table variant="simple">
						<Thead>
							<Tr>
								<Th>NAME</Th>
								<Th>HOST</Th>
								<Th>PORT</Th>
								<Th>ACTION</Th>
							</Tr>
						</Thead>
						<Tbody>
							{mpdProfileState.profiles.map((profile, index) => (
								<ProfilesProfile
									key={profile.name}
									{...{ index, profile, mpdProfileState }}
								/>
							))}
						</Tbody>
					</Table>
				</TableContainer>
			</VStack>
			<Modal isOpen={isOpen} onClose={onClose} size={"xl"} isCentered>
				<ModalOverlay />
				<ModalContent>
					<ModalBody p={0}>
						<MpdProfileForm
							onProfileCreated={async () => {
								onClose();
							}}
						/>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
}
