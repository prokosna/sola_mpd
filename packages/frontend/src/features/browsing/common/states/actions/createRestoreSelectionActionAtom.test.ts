import { create } from "@bufbuild/protobuf";
import {
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom, createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";
import type { DeviceSettingsRepository } from "../../../../common";
import {
	buildDeviceProfileSettingKey,
	deviceSettingsRepositoryAtom,
} from "../../../../common";
import {
	currentMpdProfileAtom,
	mpdProfileStateAsyncAtom,
} from "../../../../profile/states/atoms/mpdProfileAtom";
import { encodeBrowserSelection } from "../../functions/serializeBrowserSelection";
import type { ViewStateBlobRepository } from "../../repositories/ViewStateBlobRepository";
import type {
	BrowserSelection,
	SelectionQueryParam,
} from "../../types/browserSelection";
import { createResolvedSelectionAtom } from "../atoms/browsingSelectionAtom";
import { viewStateBlobRepositoryAtom } from "../atoms/viewStateBlobRepositoryAtom";

import { createRestoreSelectionActionAtom } from "./createRestoreSelectionActionAtom";

const SELECTION_QUERY_PARAM = "sel";
const LAST_POSITION_SETTING_KEY = "testLastPosition";
const PROFILE_NAME = "Home";

function createFakeDeviceSettingsRepository(
	initial: Record<string, unknown> = {},
): DeviceSettingsRepository {
	const backing = new Map<string, unknown>(Object.entries(initial));
	return {
		get: vi.fn((key: string, defaultValue?: unknown) =>
			backing.has(key) ? backing.get(key) : defaultValue,
		) as DeviceSettingsRepository["get"],
		set: vi.fn((key: string, value: unknown) => {
			backing.set(key, value);
		}) as DeviceSettingsRepository["set"],
		remove: vi.fn((key: string) => {
			backing.delete(key);
		}) as DeviceSettingsRepository["remove"],
		listKeys: vi.fn((prefix: string) =>
			[...backing.keys()].filter((key) => key.startsWith(prefix)),
		) as DeviceSettingsRepository["listKeys"],
	};
}

function createFakeViewStateBlobRepository(
	overrides: Partial<ViewStateBlobRepository> = {},
): ViewStateBlobRepository {
	return {
		save: vi.fn(async () => "token"),
		fetch: vi.fn(async () => undefined),
		...overrides,
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

const cacheKey = buildDeviceProfileSettingKey(
	PROFILE_NAME,
	LAST_POSITION_SETTING_KEY,
);

async function createHarness(params: {
	deviceSettings?: Record<string, unknown>;
	viewStateBlobRepository?: ViewStateBlobRepository;
	withProfile?: boolean;
}) {
	const store = createStore();
	const resolvedSelectionAtom = createResolvedSelectionAtom();
	const isLoadingAtom = atom(false);
	const setIsLoadingActionAtom = atom(null, (_get, set, isLoading: boolean) => {
		set(isLoadingAtom, isLoading);
	});
	const restoreActionAtom = createRestoreSelectionActionAtom({
		selectionQueryParam: SELECTION_QUERY_PARAM,
		lastPositionSettingKey: LAST_POSITION_SETTING_KEY,
		resolvedSelectionAtom,
		setIsLoadingActionAtom,
	});

	store.set(
		deviceSettingsRepositoryAtom,
		createFakeDeviceSettingsRepository(params.deviceSettings),
	);
	store.set(
		viewStateBlobRepositoryAtom,
		params.viewStateBlobRepository ?? createFakeViewStateBlobRepository(),
	);
	store.set(
		mpdProfileStateAsyncAtom,
		Promise.resolve(
			create(MpdProfileStateSchema, {
				profiles:
					params.withProfile === false
						? []
						: [
								create(MpdProfileSchema, {
									name: PROFILE_NAME,
									host: "localhost",
									port: 6600,
								}),
							],
			}),
		),
	);
	store.get(currentMpdProfileAtom); // primes the unwrap promise cache
	await flush();

	return { store, restoreActionAtom, resolvedSelectionAtom, isLoadingAtom };
}

function cachedInline(selection: BrowserSelection): SelectionQueryParam {
	return {
		key: SELECTION_QUERY_PARAM,
		value: encodeBrowserSelection(selection),
	};
}

/** Mirrors how the action replays a cached param back into a search string. */
function toSearch(param: SelectionQueryParam): string {
	return new URLSearchParams({ [param.key]: param.value }).toString();
}

// The last-position cache is the branch neither feature's own test covers: it
// only runs when the URL carries no selection at all, i.e. on startup and in a
// fresh tab.
describe("createRestoreSelectionActionAtom last-position cache", () => {
	it("restores the cached position and asks the caller to redirect when the URL carries no selection", async () => {
		const selection: BrowserSelection = [
			{ tag: Song_MetadataTag.ARTIST, values: ["Beatles"] },
		];
		const { store, restoreActionAtom, resolvedSelectionAtom } =
			await createHarness({
				deviceSettings: { [cacheKey]: cachedInline(selection) },
			});

		const result = await store.set(restoreActionAtom, "");

		expect(store.get(resolvedSelectionAtom)).toEqual(selection);
		expect(result.redirectSearch).toBe(toSearch(cachedInline(selection)));
	});

	it("does not redirect when an explicit selection is already in the URL", async () => {
		const cached: BrowserSelection = [
			{ tag: Song_MetadataTag.ARTIST, values: ["Cached"] },
		];
		const fromUrl: BrowserSelection = [
			{ tag: Song_MetadataTag.ARTIST, values: ["FromUrl"] },
		];
		const { store, restoreActionAtom, resolvedSelectionAtom } =
			await createHarness({
				deviceSettings: { [cacheKey]: cachedInline(cached) },
			});

		const search = toSearch(cachedInline(fromUrl));
		const result = await store.set(restoreActionAtom, search);

		expect(result).toEqual({});
		expect(store.get(resolvedSelectionAtom)).toEqual(fromUrl);
	});

	it("resolves a cached blob token, raising the loading state while it runs", async () => {
		const selection: BrowserSelection = [
			{ tag: Song_MetadataTag.GENRE, values: ["Rock"] },
		];
		const { store, restoreActionAtom, resolvedSelectionAtom, isLoadingAtom } =
			await createHarness({
				deviceSettings: {
					[cacheKey]: { key: "vs", value: "token" },
				},
				viewStateBlobRepository: createFakeViewStateBlobRepository({
					fetch: vi.fn(async () => encodeBrowserSelection(selection)),
				}),
			});

		const promise = store.set(restoreActionAtom, "");
		expect(store.get(isLoadingAtom)).toBe(true);
		await promise;

		expect(store.get(resolvedSelectionAtom)).toEqual(selection);
	});

	it("resolves to an empty selection when nothing is cached", async () => {
		const { store, restoreActionAtom, resolvedSelectionAtom } =
			await createHarness({});

		const result = await store.set(restoreActionAtom, "");

		expect(result).toEqual({});
		expect(store.get(resolvedSelectionAtom)).toEqual([]);
	});

	// The cache is keyed per profile, so with no profile resolved there is no
	// key to read and the position must not leak in from another library.
	it("resolves to an empty selection when no profile is available", async () => {
		const { store, restoreActionAtom, resolvedSelectionAtom } =
			await createHarness({
				deviceSettings: {
					[cacheKey]: cachedInline([
						{ tag: Song_MetadataTag.ARTIST, values: ["Beatles"] },
					]),
				},
				withProfile: false,
			});

		const result = await store.set(restoreActionAtom, "");

		expect(result).toEqual({});
		expect(store.get(resolvedSelectionAtom)).toEqual([]);
	});
});
