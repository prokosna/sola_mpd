import { create } from "@bufbuild/protobuf";
import {
	PluginInfoSchema,
	PluginRegisterResponseSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { PluginService } from "../services/PluginService";

import { connectPlugin, validateIpAndPort } from "./pluginConnectionValidation";

function createMockPluginService(
	registerFn: PluginService["register"],
): PluginService {
	return {
		register: registerFn,
		execute: vi.fn() as unknown as PluginService["execute"],
	};
}

describe("pluginConnectionValidation", () => {
	describe("validateIpAndPort", () => {
		it("should accept valid host:port", () => {
			expect(validateIpAndPort("localhost:8080")).toBe(true);
			expect(validateIpAndPort("192.168.1.1:443")).toBe(true);
			expect(validateIpAndPort("my-server:1234")).toBe(true);
			expect(validateIpAndPort("host:0")).toBe(true);
			expect(validateIpAndPort("host:65535")).toBe(true);
		});

		it("should reject missing port", () => {
			expect(validateIpAndPort("localhost")).toBe(false);
		});

		it("should reject empty port", () => {
			expect(validateIpAndPort("127.0.0.1:")).toBe(false);
		});

		it("should reject port out of range", () => {
			expect(validateIpAndPort("server:70000")).toBe(false);
		});

		it("should reject empty string", () => {
			expect(validateIpAndPort("")).toBe(false);
		});

		it("should reject port-only input", () => {
			expect(validateIpAndPort(":8080")).toBe(false);
		});
	});

	describe("connectPlugin", () => {
		it("should return error when endpoint is undefined", async () => {
			const service = createMockPluginService(vi.fn());

			const result = await connectPlugin(undefined, service);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errorMessage).toBe("Endpoint is required.");
			}
		});

		it("should return error when endpoint format is invalid", async () => {
			const service = createMockPluginService(vi.fn());

			const result = await connectPlugin("invalid-endpoint", service);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errorMessage).toContain("[IP]:[PORT]");
			}
		});

		it("should return error when registration returns no info", async () => {
			const service = createMockPluginService(async () =>
				create(PluginRegisterResponseSchema, {}),
			);

			const result = await connectPlugin("localhost:8080", service);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errorMessage).toContain("info is undefined");
			}
		});

		it("should return plugin when registration succeeds", async () => {
			const info = create(PluginInfoSchema, { name: "TestPlugin" });
			const service = createMockPluginService(async () =>
				create(PluginRegisterResponseSchema, { info }),
			);

			const result = await connectPlugin("localhost:8080", service);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.plugin.host).toBe("localhost");
				expect(result.plugin.port).toBe(8080);
				expect(result.plugin.isAvailable).toBe(true);
				expect(result.plugin.info).toEqual(info);
			}
		});

		it("should return error when registration throws", async () => {
			const service = createMockPluginService(async () => {
				throw new Error("Connection refused");
			});

			const result = await connectPlugin("localhost:8080", service);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errorMessage).toBe("Connection refused");
			}
		});
	});
});
