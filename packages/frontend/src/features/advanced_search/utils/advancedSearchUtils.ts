import { create, toJsonString } from "@bufbuild/protobuf";
import {
	AdvancedSearchRequestSchema,
	AdvancedSearchResponseSchema,
	type AdvancedSearchStats,
} from "@sola_mpd/domain/src/models/advanced_search_pb.js";
import type { AdvancedSearchClient } from "../services/AdvancedSearchClient";

export async function fetchAdvancedSearchStats(
	client: AdvancedSearchClient,
	endpoint: string,
): Promise<AdvancedSearchStats> {
	const req = create(AdvancedSearchRequestSchema, {
		config: {
			endpoint,
		},
		command: {
			case: "stats",
			value: {},
		},
	});
	const res = await client.command(req);
	if (res.command.case !== "stats" || res.command.value.stats === undefined) {
		throw Error(
			`Invalid AdvancedSearch response: ${toJsonString(AdvancedSearchResponseSchema, res)}`,
		);
	}
	return res.command.value.stats;
}

export async function scanLibrary(
	client: AdvancedSearchClient,
	endpoint: string,
): Promise<void> {
	const req = create(AdvancedSearchRequestSchema, {
		config: {
			endpoint,
		},
		command: {
			case: "scanLibrary",
			value: {},
		},
	});
	await client.command(req);
	return;
}

export async function vacuumLibrary(
	client: AdvancedSearchClient,
	endpoint: string,
): Promise<void> {
	const req = create(AdvancedSearchRequestSchema, {
		config: {
			endpoint,
		},
		command: {
			case: "vacuumLibrary",
			value: {},
		},
	});
	await client.command(req);
	return;
}

export async function analyze(
	client: AdvancedSearchClient,
	endpoint: string,
): Promise<void> {
	const req = create(AdvancedSearchRequestSchema, {
		config: {
			endpoint,
		},
		command: {
			case: "analyze",
			value: {},
		},
	});
	await client.command(req);
	return;
}
