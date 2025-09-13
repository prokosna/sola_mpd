import {
	Button,
	Divider,
	Group,
	Stack,
	Table,
	TextInput,
	Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { AdvancedSearchStats } from "@sola_mpd/domain/src/models/advanced_search_pb.js";
import {
	useAdvancedSearchQueryLimitState,
	useAnalyze,
	useScanLibrary,
	useSetAdvancedSearchQueryLimitState,
	useVacuumLibrary,
} from "../../advanced_search";

export function AdvancedSearchSettings({
	stats,
}: {
	stats: AdvancedSearchStats;
}) {
	const setAdvancedSearchQueryLimit = useSetAdvancedSearchQueryLimitState();
	const advancedSearchQueryLimit = useAdvancedSearchQueryLimitState();
	const scanLibrary = useScanLibrary();
	const vacuumLibrary = useVacuumLibrary();
	const analyze = useAnalyze();

	const form = useForm({
		mode: "uncontrolled",
		initialValues: {
			limit: advancedSearchQueryLimit,
		},
		validate: {
			limit: (value) => {
				if (value === undefined || value === null) {
					return "Limit is required";
				}
				if (value < 1) {
					return "Limit must be greater than 0";
				}
				return undefined;
			},
		},
		onValuesChange: (values) => {
			form.validate();
			if (form.isValid()) {
				setAdvancedSearchQueryLimit(values.limit);
			}
		},
	});

	return (
		<Stack gap={16} maw="70%">
			<Title order={1} size="lg">
				Advanced Search
			</Title>
			<form>
				<Group>
					<TextInput
						label="Query Limit"
						maw="100"
						type="number"
						key={form.key("limit")}
						{...form.getInputProps("limit")}
					/>
				</Group>
			</form>
			<Table>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Total Songs</Table.Th>
						<Table.Th>Songs ready for Similarity Search</Table.Th>
						<Table.Th>Songs ready for Text-to-Music Search</Table.Th>
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
				<Button w={150} size="sm" onClick={vacuumLibrary}>
					Vacuum Library
				</Button>
				<Button w={150} size="sm" onClick={analyze}>
					Analyze
				</Button>
			</Group>
		</Stack>
	);
}
