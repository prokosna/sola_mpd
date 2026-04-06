import { create } from "@bufbuild/protobuf";
import type { PluginExecuteResponse } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import {
	PluginExecuteResponse_Status,
	PluginExecuteResponseSchema,
	PluginSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { Observable } from "rxjs";
import { describe, expect, it, vi } from "vitest";

import type { PluginService } from "../services/PluginService";

import type { PluginExecutionCallbacks } from "./pluginExecutionRouting";
import {
	buildPluginExecuteRequest,
	createPluginExecutionCompleteResponse,
	executePluginWithRouting,
} from "./pluginExecutionRouting";

describe("pluginExecutionRouting", () => {
	describe("buildPluginExecuteRequest", () => {
		it("should build request with plugin host, port, and parameters", () => {
			const plugin = create(PluginSchema, {
				host: "localhost",
				port: 8080,
				pluginParameters: { key1: "val1" },
			});
			const songs = [
				create(SongSchema, { path: "/a.mp3" }),
				create(SongSchema, { path: "/b.mp3" }),
			];
			const parameters = new Map([
				["param1", "value1"],
				["param2", "value2"],
			]);

			const req = buildPluginExecuteRequest(plugin, songs, parameters);

			expect(req.host).toBe("localhost");
			expect(req.port).toBe(8080);
			expect(req.songs).toHaveLength(2);
			expect(req.requestParameters).toEqual({
				param1: "value1",
				param2: "value2",
			});
			expect(req.pluginParameters).toEqual({ key1: "val1" });
		});

		it("should handle empty parameters", () => {
			const plugin = create(PluginSchema, {
				host: "localhost",
				port: 8080,
			});
			const req = buildPluginExecuteRequest(
				plugin,
				[],
				new Map<string, string>(),
			);

			expect(req.songs).toHaveLength(0);
			expect(req.requestParameters).toEqual({});
		});
	});

	describe("executePluginWithRouting", () => {
		const plugin = create(PluginSchema, {
			host: "localhost",
			port: 8080,
		});
		const songs = [create(SongSchema, { path: "/a.mp3" })];
		const parameters = new Map<string, string>();

		function createCallbacks(): PluginExecutionCallbacks & {
			responses: PluginExecuteResponse[];
			warnings: string[];
			errors: Error[];
			completions: PluginExecuteResponse[];
		} {
			const state = {
				responses: [] as PluginExecuteResponse[],
				warnings: [] as string[],
				errors: [] as Error[],
				completions: [] as PluginExecuteResponse[],
				onResponse: vi.fn((resp: PluginExecuteResponse) => {
					state.responses.push(resp);
				}),
				onWarning: vi.fn((msg: string) => {
					state.warnings.push(msg);
				}),
				onError: vi.fn((err: Error) => {
					state.errors.push(err);
				}),
				onComplete: vi.fn((resp: PluginExecuteResponse) => {
					state.completions.push(resp);
				}),
			};
			return state;
		}

		it("should route OK responses to onResponse", () => {
			const okResp = create(PluginExecuteResponseSchema, {
				message: "progress",
				progressPercentage: 50,
				status: PluginExecuteResponse_Status.OK,
			});
			const pluginService: PluginService = {
				register: vi.fn(),
				execute: vi.fn(
					() =>
						new Observable<PluginExecuteResponse>((subscriber) => {
							subscriber.next(okResp);
							subscriber.complete();
						}),
				),
			};
			const cb = createCallbacks();

			executePluginWithRouting(plugin, songs, parameters, pluginService, cb);

			expect(cb.onResponse).toHaveBeenCalledWith(okResp);
			expect(cb.onWarning).not.toHaveBeenCalled();
			expect(cb.completions).toHaveLength(1);
			expect(cb.completions[0].progressPercentage).toBe(100);
		});

		it("should route WARN responses to both onWarning and onResponse", () => {
			const warnResp = create(PluginExecuteResponseSchema, {
				message: "something is off",
				progressPercentage: 30,
				status: PluginExecuteResponse_Status.WARN,
			});
			const pluginService: PluginService = {
				register: vi.fn(),
				execute: vi.fn(
					() =>
						new Observable<PluginExecuteResponse>((subscriber) => {
							subscriber.next(warnResp);
							subscriber.complete();
						}),
				),
			};
			const cb = createCallbacks();

			executePluginWithRouting(plugin, songs, parameters, pluginService, cb);

			expect(cb.onWarning).toHaveBeenCalledWith("something is off");
			expect(cb.onResponse).toHaveBeenCalledWith(warnResp);
		});

		it("should wrap Error instances and route to onError", () => {
			const pluginService: PluginService = {
				register: vi.fn(),
				execute: vi.fn(
					() =>
						new Observable<PluginExecuteResponse>((subscriber) => {
							subscriber.error(new Error("connection lost"));
						}),
				),
			};
			const cb = createCallbacks();

			executePluginWithRouting(plugin, songs, parameters, pluginService, cb);

			expect(cb.errors).toHaveLength(1);
			expect(cb.errors[0]).toBeInstanceOf(Error);
			expect(cb.errors[0].message).toBe("connection lost");
			expect(cb.onComplete).not.toHaveBeenCalled();
		});

		it("should wrap non-Error values in Error and route to onError", () => {
			const pluginService: PluginService = {
				register: vi.fn(),
				execute: vi.fn(
					() =>
						new Observable<PluginExecuteResponse>((subscriber) => {
							subscriber.error("string error");
						}),
				),
			};
			const cb = createCallbacks();

			executePluginWithRouting(plugin, songs, parameters, pluginService, cb);

			expect(cb.errors).toHaveLength(1);
			expect(cb.errors[0]).toBeInstanceOf(Error);
			expect(cb.errors[0].message).toBe("string error");
		});
	});

	describe("createPluginExecutionCompleteResponse", () => {
		it("should create a completion response with correct song count", () => {
			const resp = createPluginExecutionCompleteResponse(42);

			expect(resp.message).toBe("Complete: Total 42 songs");
			expect(resp.progressPercentage).toBe(100);
			expect(resp.status).toBe(PluginExecuteResponse_Status.OK);
		});

		it("should handle zero songs", () => {
			const resp = createPluginExecutionCompleteResponse(0);

			expect(resp.message).toBe("Complete: Total 0 songs");
			expect(resp.progressPercentage).toBe(100);
		});
	});
});
