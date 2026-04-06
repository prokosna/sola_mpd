import { create } from "@bufbuild/protobuf";
import {
	type Plugin,
	PluginInfoSchema,
	type PluginRegisterResponse,
	PluginRegisterResponseSchema,
	PluginSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { PluginService } from "../services/PluginService";

import {
	registerAllPluginsAndCheckAvailability,
	registerPluginAndCheckAvailability,
} from "./pluginRegistration";

function createPlugin(host: string, port: number): Plugin {
	return create(PluginSchema, { host, port });
}

function createMockPluginService(
	registerFn: PluginService["register"],
): PluginService {
	return {
		register: registerFn,
		execute: vi.fn() as unknown as PluginService["execute"],
	};
}

describe("pluginRegistration", () => {
	describe("registerPluginAndCheckAvailability", () => {
		it("should mark plugin as available when registration succeeds with info", async () => {
			const info = create(PluginInfoSchema, { name: "TestPlugin" });
			const service = createMockPluginService(async () =>
				create(PluginRegisterResponseSchema, { info }),
			);
			const plugin = createPlugin("localhost", 8080);

			const result = await registerPluginAndCheckAvailability(plugin, service);

			expect(result.isAvailable).toBe(true);
			expect(result.info).toEqual(info);
			expect(result.host).toBe("localhost");
			expect(result.port).toBe(8080);
		});

		it("should mark plugin as unavailable when registration returns no info", async () => {
			const service = createMockPluginService(async () =>
				create(PluginRegisterResponseSchema, {}),
			);
			const plugin = createPlugin("localhost", 8080);

			const result = await registerPluginAndCheckAvailability(plugin, service);

			expect(result.isAvailable).toBe(false);
			expect(result.info).toBeUndefined();
		});

		it("should mark plugin as unavailable when registration throws", async () => {
			const service = createMockPluginService(async () => {
				throw new Error("Connection refused");
			});
			const plugin = createPlugin("localhost", 9999);

			const result = await registerPluginAndCheckAvailability(plugin, service);

			expect(result.isAvailable).toBe(false);
		});
	});

	describe("registerAllPluginsAndCheckAvailability", () => {
		it("should register all plugins and return updated list", async () => {
			const info = create(PluginInfoSchema, { name: "TestPlugin" });
			let callCount = 0;
			const service = createMockPluginService(
				async (): Promise<PluginRegisterResponse> => {
					callCount++;
					if (callCount === 1) {
						return create(PluginRegisterResponseSchema, { info });
					}
					throw new Error("fail");
				},
			);

			const plugins = [
				createPlugin("host1", 8080),
				createPlugin("host2", 9090),
			];

			const results = await registerAllPluginsAndCheckAvailability(
				plugins,
				service,
			);

			expect(results).toHaveLength(2);
			expect(results[0].isAvailable).toBe(true);
			expect(results[1].isAvailable).toBe(false);
		});

		it("should return empty array for empty plugins", async () => {
			const service = createMockPluginService(async () =>
				create(PluginRegisterResponseSchema, {}),
			);

			const results = await registerAllPluginsAndCheckAvailability([], service);

			expect(results).toHaveLength(0);
		});
	});
});
