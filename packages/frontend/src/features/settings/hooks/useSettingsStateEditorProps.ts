import type { Message } from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";

import { useDisclosure } from "@mantine/hooks";
import { useCallback } from "react";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import type { SettingsStatesEditorProps } from "../components/SettingsStatesEditor";

export function useSettingsStateEditorProps<T extends Message>(
	schema: GenMessage<T>,
	state: T | undefined,
	update: (newState: T) => Promise<boolean>,
): [() => void, SettingsStatesEditorProps<T> | undefined] {
	const notify = useNotification();

	const [opened, { open, close }] = useDisclosure(false);

	const onSave = useCallback(
		async (newState: T) => {
			const saved = await update(newState);
			if (saved) {
				notify({
					status: "success",
					title: "Settings successfully updated",
				});
			}
			return saved;
		},
		[notify, update],
	);

	if (state === undefined) {
		return [open, undefined];
	}

	return [
		open,
		{
			schema,
			state,
			onSave,
			isOpen: opened,
			onClose: close,
		},
	];
}
