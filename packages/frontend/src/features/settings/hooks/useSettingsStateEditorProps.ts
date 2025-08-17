import type { Message } from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";

import { useDisclosure } from "@mantine/hooks";
import { useCallback } from "react";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import type { SettingsStatesEditorProps } from "../components/SettingsStatesEditor";

/**
 * Manage settings state editor.
 *
 * @template T State type extending Protobuf Message
 * @param state Current state
 * @param update Update callback
 * @param fromJson JSON parser
 * @returns [Modal opener, Editor props]
 */
export function useSettingsStateEditorProps<T extends Message>(
	schema: GenMessage<T>,
	state: T | undefined,
	update: (newState: T) => Promise<void>,
): [() => void, SettingsStatesEditorProps<T> | undefined] {
	const notify = useNotification();

	const [opened, { open, close }] = useDisclosure(false);

	const onSave = useCallback(
		async (newState: T) => {
			update(newState);
			notify({
				status: "success",
				title: "State successfully updated",
				description: "The state has been updated.",
			});
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
