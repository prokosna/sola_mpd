import { Button, Modal, Stack, Table, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAtomValue } from "jotai";
import { CenterSpinner } from "../../loading";
import {
	currentMpdProfileAtom,
	MpdProfileForm,
	mpdProfileStateAtom,
} from "../../profile";
import { ProfilesProfile } from "./ProfilesProfile";

export function Profiles() {
	const mpdProfileState = useAtomValue(mpdProfileStateAtom);
	const currentMpdProfile = useAtomValue(currentMpdProfileAtom);

	const [opened, { open, close }] = useDisclosure(false);

	if (mpdProfileState === undefined) {
		return <CenterSpinner />;
	}

	return (
		<>
			<Modal centered opened={opened} onClose={close} title="New MPD Profile">
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
				<Text size="sm" c="dimmed" maw={720}>
					The profile list is shared with every device. Each device chooses
					which profile it plays from in the header.
				</Text>
				<Button w={200} size="sm" onClick={open}>
					New Profile
				</Button>
				<Table maw={900}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>NAME</Table.Th>
							<Table.Th>HOST</Table.Th>
							<Table.Th>PORT</Table.Th>
							<Table.Th>PASSWORD</Table.Th>
							<Table.Th>STATUS</Table.Th>
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
								isActiveOnThisDevice={profile.name === currentMpdProfile?.name}
							/>
						))}
					</Table.Tbody>
				</Table>
			</Stack>
		</>
	);
}
