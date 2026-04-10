import { Button } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { playerStatusIsDatabaseUpdatingAtom } from "../../player";
import { updateDatabaseActionAtom } from "../states/actions/updateDatabaseActionAtom";

export function CardStatsDatabaseButton() {
	const notify = useNotification();

	const playerStatusIsDatabaseUpdating = useAtomValue(
		playerStatusIsDatabaseUpdatingAtom,
	);
	const updateDatabase = useSetAtom(updateDatabaseActionAtom);

	const handleDatabaseUpdateButtonClick = useCallback(async () => {
		await updateDatabase();
		notify({
			status: "info",
			title: "Update MPD Database",
			description: "Database is now updating...",
		});
	}, [updateDatabase, notify]);

	return (
		<Button
			loading={playerStatusIsDatabaseUpdating}
			loaderProps={{ type: "dots" }}
			w="100%"
			variant="outline"
			onClick={() => {
				if (!playerStatusIsDatabaseUpdating) {
					handleDatabaseUpdateButtonClick();
				}
			}}
		>
			Update Database
		</Button>
	);
}
