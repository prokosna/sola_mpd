import { create } from "@bufbuild/protobuf";
import { timestampDate } from "@bufbuild/protobuf/wkt";
import {
	type FilterCondition,
	FilterCondition_Operator,
} from "@sola_mpd/shared/src/models/filter_pb.js";
import {
	type MpdRequest,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import type { MpdClient } from "../../../mpd";

import {
	computeSinceTime,
	fetchRecentlyAddedFastDelta,
} from "./recentlyAddedFastFetch";

function captureMpdClient(): {
	client: MpdClient;
	requests: MpdRequest[];
} {
	const requests: MpdRequest[] = [];
	const client: MpdClient = {
		async command(req) {
			requests.push(req);
			return create(MpdResponseSchema, {
				command: { case: "search", value: { songs: [] } },
			});
		},
		async commandBulk() {
			throw new Error("not used");
		},
	} as unknown as MpdClient;
	return { client, requests };
}

describe("fetchRecentlyAddedFastDelta", () => {
	it("builds a search request with added-since, sort -Added and window offset:", async () => {
		const { client, requests } = captureMpdClient();
		const profile = create(MpdProfileSchema, {
			name: "p",
			host: "h",
			port: 6600,
		});
		const since = new Date("2024-03-15T10:30:00.000Z");

		await fetchRecentlyAddedFastDelta(client, profile, since, 250);

		expect(requests).toHaveLength(1);
		const cmd = requests[0].command;
		if (cmd.case !== "search") {
			throw new Error("expected search request");
		}

		expect(cmd.value.conditions).toHaveLength(1);
		const condition = cmd.value.conditions[0] as FilterCondition;
		expect(condition.operator).toBe(FilterCondition_Operator.ADDED_SINCE);
		expect(condition.tag).toBe(Song_MetadataTag.ADDED_AT);
		if (condition.value?.value.case !== "timestamp") {
			throw new Error("expected timestamp value");
		}
		expect(timestampDate(condition.value.value.value).toISOString()).toBe(
			"2024-03-15T10:30:00.000Z",
		);

		expect(cmd.value.sort?.tag).toBe(Song_MetadataTag.ADDED_AT);
		expect(cmd.value.sort?.descending).toBe(true);
		expect(cmd.value.window?.start).toBe(250);
		expect(cmd.value.window?.end).toBe(0);
	});
});

describe("computeSinceTime", () => {
	it("subtracts days from the supplied reference time", () => {
		const now = new Date("2026-05-04T12:00:00.000Z");
		expect(computeSinceTime(0, now).toISOString()).toBe(
			"2026-05-04T12:00:00.000Z",
		);
		expect(computeSinceTime(90, now).toISOString()).toBe(
			"2026-02-03T12:00:00.000Z",
		);
		const ms = 36500 * 24 * 60 * 60 * 1000;
		expect(computeSinceTime(36500, now).getTime()).toBe(now.getTime() - ms);
	});
});
