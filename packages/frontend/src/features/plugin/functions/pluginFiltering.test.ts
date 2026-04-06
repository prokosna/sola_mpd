import { create } from "@bufbuild/protobuf";
import {
	Plugin_PluginType,
	PluginInfoSchema,
	PluginSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { describe, expect, it } from "vitest";

import { filterAvailablePlugins } from "./pluginFiltering";

function createPlugin(
	isAvailable: boolean,
	supportedTypes: Plugin_PluginType[],
) {
	return create(PluginSchema, {
		host: "localhost",
		port: 50051,
		isAvailable,
		info: create(PluginInfoSchema, {
			name: "TestPlugin",
			contextMenuTitle: "Test",
			supportedTypes,
		}),
	});
}

describe("filterAvailablePlugins", () => {
	it("should return only available plugins matching the type", () => {
		const plugins = [
			createPlugin(true, [Plugin_PluginType.ON_PLAYLIST]),
			createPlugin(true, [Plugin_PluginType.ON_PLAY_QUEUE]),
			createPlugin(false, [Plugin_PluginType.ON_PLAYLIST]),
		];
		const result = filterAvailablePlugins(
			plugins,
			Plugin_PluginType.ON_PLAYLIST,
		);
		expect(result).toHaveLength(1);
	});

	it("should include plugins with ON_ALL type", () => {
		const plugins = [
			createPlugin(true, [Plugin_PluginType.ON_ALL]),
			createPlugin(true, [Plugin_PluginType.ON_PLAYLIST]),
		];
		const result = filterAvailablePlugins(
			plugins,
			Plugin_PluginType.ON_PLAY_QUEUE,
		);
		expect(result).toHaveLength(1);
		expect(result[0].info?.supportedTypes).toContain(Plugin_PluginType.ON_ALL);
	});

	it("should return empty array when no plugins match", () => {
		const plugins = [
			createPlugin(false, [Plugin_PluginType.ON_PLAYLIST]),
			createPlugin(true, [Plugin_PluginType.ON_PLAY_QUEUE]),
		];
		const result = filterAvailablePlugins(
			plugins,
			Plugin_PluginType.ON_PLAYLIST,
		);
		expect(result).toHaveLength(0);
	});

	it("should return empty array for empty input", () => {
		const result = filterAvailablePlugins([], Plugin_PluginType.ON_PLAYLIST);
		expect(result).toHaveLength(0);
	});
});
