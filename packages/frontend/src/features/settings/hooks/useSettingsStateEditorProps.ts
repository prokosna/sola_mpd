import type { Message } from "@bufbuild/protobuf";
import { useDisclosure } from "@chakra-ui/react";
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
	state: T | undefined,
	update: (newState: T) => Promise<void>,
	fromJson: (json: string) => T,
): [() => void, SettingsStatesEditorProps<T> | undefined] {
	const notify = useNotification();

	const { isOpen, onOpen, onClose } = useDisclosure();

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
		return [onOpen, undefined];
	}

	return [
		onOpen,
		{
			state,
			onSave,
			isOpen,
			onClose,
			fromJson,
		},
	];
}
