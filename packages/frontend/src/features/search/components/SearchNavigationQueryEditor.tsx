import {
	ActionIcon,
	Badge,
	Button,
	Center,
	Divider,
	Flex,
	Grid,
	Group,
	ScrollArea,
	Select,
	Stack,
	Text,
	TextInput,
	Tooltip,
	useComputedColorScheme,
	useMantineTheme,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import { FilterCondition_Operator } from "@sola_mpd/shared/src/models/filter_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { IconAlertTriangle, IconPlus, IconTrash } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { FullWidthSkeleton } from "../../loading";
import { mpdCapabilitiesAtom } from "../../mpd/states/atoms/mpdCapabilitiesAtom";
import {
	convertDisplayNameToOperator,
	convertOperatorToDisplayName,
	listAllFilterConditionOperators,
} from "../../song_filter";
import {
	convertSongMetadataTagFromDisplayName,
	convertSongMetadataTagToDisplayName,
} from "../../song_table";
import {
	isValidOperatorWithMetadataTag,
	listSearchSongMetadataTags,
} from "../functions/search";
import { useSearchQueryEditorHandlers } from "../hooks/useSearchQueryEditorHandlers";
import { isSearchLoadingAtom } from "../states/atoms/searchUiAtom";
import {
	type ConditionFormValues,
	EditingSearchStatus,
	type SearchFormValues,
} from "../types/searchTypes";

const DATE_INPUT_TAGS: readonly Song_MetadataTag[] = [
	Song_MetadataTag.UPDATED_AT,
	Song_MetadataTag.ADDED_AT,
];

const UNSUPPORTED_CONDITION_TOOLTIP =
	"Ignored when searching; requires MPD 0.24+";

function isDateInputTag(tagDisplayName: string): boolean {
	const tag = convertSongMetadataTagFromDisplayName(tagDisplayName);
	return tag !== undefined && DATE_INPUT_TAGS.includes(tag);
}

function isConditionUnsupportedOnCurrentServer(
	condition: ConditionFormValues,
	supportsAddedSince: boolean,
): boolean {
	if (supportsAddedSince) {
		return false;
	}
	let operator: FilterCondition_Operator | undefined;
	try {
		operator = convertDisplayNameToOperator(condition.operator);
	} catch {
		operator = undefined;
	}
	if (operator === FilterCondition_Operator.ADDED_SINCE) {
		return true;
	}
	const tag = convertSongMetadataTagFromDisplayName(condition.tag);
	return tag === Song_MetadataTag.ADDED_AT;
}

export function SearchNavigationQueryEditor({
	form,
	editingSearchStatus,
}: {
	form: UseFormReturnType<SearchFormValues>;
	editingSearchStatus: EditingSearchStatus;
}) {
	const scheme = useComputedColorScheme();
	const theme = useMantineTheme();
	const isSearchLoading = useAtomValue(isSearchLoadingAtom);
	const { supportsAddedSince } = useAtomValue(mpdCapabilitiesAtom);

	const {
		handleSave,
		handleReset,
		handleSearch,
		handleAddCondition,
		handleDeleteCondition,
		handleAddQuery,
		isNewSearch,
		savedSearches,
	} = useSearchQueryEditorHandlers(form);

	// Hide ADDED_AT tag and the matching ADDED_SINCE operator on legacy MPDs
	// so users cannot author queries the server cannot evaluate.
	const availableTags = listSearchSongMetadataTags().filter(
		(tag) => supportsAddedSince || tag !== Song_MetadataTag.ADDED_AT,
	);
	const availableOperators = listAllFilterConditionOperators().filter(
		(operator) =>
			supportsAddedSince || operator !== FilterCondition_Operator.ADDED_SINCE,
	);

	if (savedSearches === undefined) {
		return <FullWidthSkeleton />;
	}

	const queries = form.getValues().queries;

	return (
		<Stack h="100%" gap={0}>
			<Group
				w="100%"
				mih="32px"
				mah="32px"
				bg={scheme === "light" ? theme.colors.gray[2] : theme.colors.dark[6]}
				px={8}
				m={0}
			>
				<Text fw={700} size="sm">
					Search Editor
				</Text>
			</Group>
			<Divider p={0} m={0} />
			<ScrollArea p={16} scrollbarSize="y">
				<form onSubmit={form.onSubmit(handleSave)}>
					<Group p={4} wrap="nowrap">
						<TextInput
							size="xs"
							w="60%"
							key={form.key("name")}
							{...form.getInputProps("name")}
						/>
						<Center>
							{editingSearchStatus === EditingSearchStatus.SAVED ? (
								<Badge color="green" variant="outline" radius="xs" size="md">
									Saved
								</Badge>
							) : editingSearchStatus === EditingSearchStatus.NOT_SAVED ? (
								<Badge color="gray" variant="outline" radius="xs" size="md">
									Not saved
								</Badge>
							) : (
								<Badge color="blue" variant="outline" radius="xs" size="md">
									Layout updated
								</Badge>
							)}
						</Center>
					</Group>
					<Divider m={4} />
					{queries.map((query, queryIndex) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: Order is fixed.
						<Stack key={queryIndex} gap={8} mt={4} mb={8}>
							{query.conditions.map((condition, conditionIndex) => {
								const isUnsupported = isConditionUnsupportedOnCurrentServer(
									condition,
									supportsAddedSince,
								);
								const tagPath = `queries.${queryIndex}.conditions.${conditionIndex}.tag`;
								const operatorPath = `queries.${queryIndex}.conditions.${conditionIndex}.operator`;
								const valuePath = `queries.${queryIndex}.conditions.${conditionIndex}.value`;
								const tagInputProps = form.getInputProps(tagPath);
								return (
									<Grid
										w="100%"
										key={condition.uuid}
										align="center"
										justify="space-between"
										gap={1}
									>
										<Grid.Col span={1}>
											<Center>
												<ActionIcon
													size="sm"
													variant="outline"
													onClick={() => handleAddCondition(queryIndex)}
													disabled={
														conditionIndex < query.conditions.length - 1
													}
												>
													<IconPlus />
												</ActionIcon>
											</Center>
										</Grid.Col>
										<Grid.Col span={3}>
											<Select
												size="xs"
												data={availableTags.map((tag) =>
													convertSongMetadataTagToDisplayName(tag),
												)}
												key={form.key(tagPath)}
												{...tagInputProps}
												onChange={(value) => {
													tagInputProps.onChange?.(value);
													form.setFieldValue(operatorPath, "");
													form.setFieldValue(valuePath, "");
												}}
											/>
										</Grid.Col>
										<Grid.Col span={2}>
											<Select
												size="xs"
												data={availableOperators
													.filter((operator) => {
														const tag = convertSongMetadataTagFromDisplayName(
															condition.tag,
														);
														if (tag === undefined) {
															return false;
														}
														return isValidOperatorWithMetadataTag(
															tag,
															operator,
														);
													})
													.map((operator) =>
														convertOperatorToDisplayName(operator),
													)}
												key={form.key(operatorPath)}
												{...form.getInputProps(operatorPath)}
											/>
										</Grid.Col>
										<Grid.Col span={isUnsupported ? 4 : 5}>
											{isDateInputTag(condition.tag) ? (
												<DateInput
													size="xs"
													valueFormat="YYYY-MM-DD"
													key={form.key(valuePath)}
													{...form.getInputProps(valuePath)}
												/>
											) : (
												<TextInput
													size="xs"
													key={form.key(valuePath)}
													{...form.getInputProps(valuePath)}
												/>
											)}
										</Grid.Col>
										{isUnsupported && (
											<Grid.Col span={1}>
												<Center>
													<Tooltip label={UNSUPPORTED_CONDITION_TOOLTIP}>
														<IconAlertTriangle
															size={16}
															aria-label="Unsupported condition"
														/>
													</Tooltip>
												</Center>
											</Grid.Col>
										)}
										<Grid.Col span={1}>
											<Center>
												<ActionIcon
													size="sm"
													variant="outline"
													onClick={() =>
														handleDeleteCondition(queryIndex, conditionIndex)
													}
													disabled={
														query.conditions.length === 1 && queryIndex === 0
													}
												>
													<IconTrash />
												</ActionIcon>
											</Center>
										</Grid.Col>
									</Grid>
								);
							})}
							{
								<Center>
									<Button
										size="xs"
										variant="outline"
										onClick={() => handleAddQuery()}
										disabled={queryIndex < queries.length - 1}
									>
										OR
									</Button>
								</Center>
							}
						</Stack>
					))}
					<Divider m={8} />
					<Flex gap="md" align="center">
						<Button
							size="xs"
							variant="outline"
							color="red"
							onClick={handleReset}
						>
							Reset
						</Button>
						<Button size="xs" type="submit" variant="outline">
							{isNewSearch ? "Save" : "Update"}
						</Button>
						<Button
							size="xs"
							ml="auto"
							onClick={handleSearch}
							loading={isSearchLoading}
						>
							Search
						</Button>
					</Flex>
				</form>
			</ScrollArea>
		</Stack>
	);
}
