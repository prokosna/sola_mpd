import { create } from "@bufbuild/protobuf";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { describe, expect, it } from "vitest";

import { searchParamsAtom } from "../../../../location/states/atoms/locationAtom";
import { BROWSER_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import { encodeBrowserSelection } from "../../../common/functions/serializeBrowserSelection";
import { browserFiltersAtom } from "./browserFiltersAtom";
import { browserStateAsyncAtom } from "./browserStateAtom";

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("browserFiltersAtom", () => {
	it("reflects the URL selection reactively, and re-evaluates when it changes", async () => {
		const store = createStore();
		const serverState = create(BrowserStateSchema, {
			filterTags: [Song_MetadataTag.ARTIST, Song_MetadataTag.ALBUM],
		});
		store.set(browserStateAsyncAtom, Promise.resolve(serverState));
		store.get(browserFiltersAtom); // primes the async->sync unwrap
		await flush();

		expect(
			store
				.get(browserFiltersAtom)
				?.every((f) => f.selectedValues.length === 0),
		).toBe(true);

		const selectionValue = encodeBrowserSelection([
			{ tag: Song_MetadataTag.ARTIST, values: ["Beatles"] },
		]);
		const params = new URLSearchParams();
		params.set(BROWSER_SELECTION_QUERY_PARAM, selectionValue);
		store.set(searchParamsAtom, `?${params.toString()}`);

		const withSelection = store.get(browserFiltersAtom);
		const artistFilter = withSelection?.find(
			(f) => f.tag === Song_MetadataTag.ARTIST,
		);
		expect(artistFilter?.selectedValues).toEqual(["Beatles"]);
		const albumFilter = withSelection?.find(
			(f) => f.tag === Song_MetadataTag.ALBUM,
		);
		expect(albumFilter?.selectedValues).toHaveLength(0);

		// Structure (tag order) is unaffected by the URL.
		expect(withSelection?.map((f) => f.tag)).toEqual([
			Song_MetadataTag.ARTIST,
			Song_MetadataTag.ALBUM,
		]);

		store.set(searchParamsAtom, "");
		expect(
			store
				.get(browserFiltersAtom)
				?.every((f) => f.selectedValues.length === 0),
		).toBe(true);
	});
});
