import {
	Button,
	Divider,
	Group,
	NumberInput,
	Stack,
	Table,
	Text,
	Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { AdvancedSearchStats } from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import {
	advancedSearchQueryLimitAtom,
	analyzeActionAtom,
	MAX_QUERY_LIMIT,
	parseQueryLimit,
	scanLibraryActionAtom,
	setAdvancedSearchQueryLimitActionAtom,
} from "../../advanced_search";

export function AdvancedSearchSettings({
	stats,
}: {
	stats: AdvancedSearchStats;
}) {
	const setAdvancedSearchQueryLimit = useSetAtom(
		setAdvancedSearchQueryLimitActionAtom,
	);
	const advancedSearchQueryLimit = useAtomValue(advancedSearchQueryLimitAtom);
	const scanLibrary = useSetAtom(scanLibraryActionAtom);
	const analyze = useSetAtom(analyzeActionAtom);

	const form = useForm({
		mode: "uncontrolled",
		initialValues: {
			limit: advancedSearchQueryLimit as number | string,
		},
		validate: {
			limit: (value) => {
				if (value === "") {
					return "Limit is required";
				}
				if (parseQueryLimit(value) === undefined) {
					return `Limit must be an integer between 1 and ${MAX_QUERY_LIMIT}`;
				}
				return undefined;
			},
		},
		onValuesChange: (values) => {
			form.validate();
			const limit = parseQueryLimit(values.limit);
			if (limit !== undefined) {
				setAdvancedSearchQueryLimit(limit);
			}
		},
	});

	return (
		<Stack gap={12} maw={720}>
			<Title order={2} size="md">
				Advanced Search
			</Title>
			<Text size="sm" c="dimmed">
				The query limit applies to this device.
			</Text>
			<form>
				<Group>
					<NumberInput
						label="Query Limit"
						maw="100"
						min={1}
						max={MAX_QUERY_LIMIT}
						allowNegative={false}
						allowDecimal={false}
						key={form.key("limit")}
						{...form.getInputProps("limit")}
					/>
				</Group>
			</form>
			<Table>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Total Songs</Table.Th>
						<Table.Th>Songs Ready for Similarity Search</Table.Th>
						<Table.Th>Songs Ready for Text-to-Music Search</Table.Th>
						<Table.Th>Running Tasks</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					<Table.Tr>
						<Table.Td>{stats.totalSongs}</Table.Td>
						<Table.Td>{stats.songsWithMuq}</Table.Td>
						<Table.Td>{stats.songsWithMuqMulan}</Table.Td>
						<Table.Td>{stats.runningTasks}</Table.Td>
					</Table.Tr>
				</Table.Tbody>
			</Table>
			<Divider />
			<Group gap={16}>
				<Button w={150} size="sm" onClick={scanLibrary}>
					Scan Library
				</Button>
				<Button w={150} size="sm" onClick={analyze}>
					Retry Failed
				</Button>
			</Group>
			<Text size="sm" c="dimmed">
				Lainbow scans the library every hour and analyzes new songs on its own.
				Scan Library starts a scan now. Retry Failed analyzes songs whose
				analysis failed again.
			</Text>
		</Stack>
	);
}
