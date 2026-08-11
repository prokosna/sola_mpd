import { Group, Text } from "@mantine/core";
import { IconCloud, IconDeviceDesktop } from "@tabler/icons-react";

// The one thing every settings section has to say: does this value follow
// the user everywhere, or stay on this machine?
export type SettingScope = "workspace" | "device";

const SCOPE_LABEL: Record<SettingScope, string> = {
	workspace: "Shared across all devices and profiles",
	device: "Saved on this device only",
};

export function ScopeNote({ scope }: { scope: SettingScope }) {
	const Icon = scope === "workspace" ? IconCloud : IconDeviceDesktop;
	return (
		<Group gap={4} wrap="nowrap">
			<Icon size={14} />
			<Text size="xs" c="dimmed">
				{SCOPE_LABEL[scope]}
			</Text>
		</Group>
	);
}
