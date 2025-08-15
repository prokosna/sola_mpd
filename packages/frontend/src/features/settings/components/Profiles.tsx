import { useDisclosure } from "@mantine/hooks";
import { CenterSpinner } from "../../loading";
import { MpdProfileForm, useMpdProfileState } from "../../profile";

import { Button, Modal, Stack, Table, Title } from "@mantine/core";
import { ProfilesProfile } from "./ProfilesProfile";

/**
 * MPD profiles management interface.
 *
 * Displays a table of MPD connection profiles with options
 * to add, edit, and delete profiles.
 */
export function Profiles() {
	const mpdProfileState = useMpdProfileState();

	const [opened, { open, close }] = useDisclosure(false);

	if (mpdProfileState === undefined) {
		return <CenterSpinner />;
	}

	return (
		<>
			<Modal opened={opened} onClose={close} title="MPD Server Information">
				<MpdProfileForm
					onProfileCreated={async () => {
						close();
					}}
					onCancelled={async () => {
						close();
					}}
				/>
			</Modal>

			<Stack gap={16}>
				<Title order={1} size="lg">
					MPD Profiles
				</Title>
				<Button w={200} size="sm" onClick={open}>
					New Profile
				</Button>
				<Table maw="50%">
					<Table.Thead>
						<Table.Tr>
							<Table.Th>NAME</Table.Th>
							<Table.Th>HOST</Table.Th>
							<Table.Th>PORT</Table.Th>
							<Table.Th>ACTION</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{mpdProfileState.profiles.map((profile, index) => (
							<ProfilesProfile
								key={profile.name}
								index={index}
								profile={profile}
								mpdProfileState={mpdProfileState}
							/>
						))}
					</Table.Tbody>
				</Table>
			</Stack>
		</>
	);
}
