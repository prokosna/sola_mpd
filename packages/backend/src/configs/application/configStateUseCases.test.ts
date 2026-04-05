import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { BrowserState } from "@sola_mpd/shared/src/models/browser_pb.js";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import { describe, expect, it, vi } from "vitest";
import type { ConfigRepository } from "../services/ConfigRepository.js";
import {
	createReadConfigUseCase,
	createUpdateConfigUseCase,
} from "./configStateUseCases.js";

const createConfigRepository = (
	overrides?: Partial<ConfigRepository<BrowserState>>,
): ConfigRepository<BrowserState> => {
	return {
		get: vi.fn(),
		update: vi.fn(),
		...overrides,
	};
};

describe("configStateUseCases", () => {
	it("createReadConfigUseCase serializes repository value to binary", () => {
		const state = create(BrowserStateSchema, {
			filters: [],
		});
		const repository = createConfigRepository({
			get: vi.fn().mockReturnValue(state),
		});

		const read = createReadConfigUseCase(BrowserStateSchema, repository);
		const result = read();

		expect(repository.get).toHaveBeenCalledTimes(1);
		const decoded = fromBinary(BrowserStateSchema, result);
		expect(decoded).toMatchObject({ filters: [] });
	});

	it("createUpdateConfigUseCase deserializes binary and updates repository", () => {
		const state = create(BrowserStateSchema, {
			filters: [],
		});
		const binary = Buffer.from(toBinary(BrowserStateSchema, state));
		const repository = createConfigRepository();

		const update = createUpdateConfigUseCase(BrowserStateSchema, repository);
		update(binary);

		expect(repository.update).toHaveBeenCalledTimes(1);
		expect(repository.update).toHaveBeenCalledWith(
			expect.objectContaining({ filters: [] }),
		);
	});

	it("createReadConfigUseCase returns valid binary round-trip", () => {
		const state = create(BrowserStateSchema, {
			filters: [],
		});
		const repository = createConfigRepository({
			get: vi.fn().mockReturnValue(state),
		});

		const read = createReadConfigUseCase(BrowserStateSchema, repository);
		const binary = read();

		const decoded = fromBinary(BrowserStateSchema, binary);
		const reEncoded = Buffer.from(toBinary(BrowserStateSchema, decoded));
		expect(Buffer.from(binary).equals(reEncoded)).toBe(true);
	});

	it("createUpdateConfigUseCase passes deserialized message to repository", () => {
		const state = create(BrowserStateSchema, {
			filters: [],
		});
		const binary = Buffer.from(toBinary(BrowserStateSchema, state));
		const updateFn = vi.fn();
		const repository = createConfigRepository({ update: updateFn });

		const update = createUpdateConfigUseCase(BrowserStateSchema, repository);
		update(binary);

		const passedValue = updateFn.mock.calls[0][0];
		const reEncoded = fromBinary(
			BrowserStateSchema,
			toBinary(BrowserStateSchema, passedValue),
		);
		expect(reEncoded).toMatchObject({ filters: [] });
	});
});
