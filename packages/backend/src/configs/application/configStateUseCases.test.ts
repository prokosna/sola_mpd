import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { BrowserState } from "@sola_mpd/shared/src/models/browser_pb.js";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import { describe, expect, it, vi } from "vitest";
import type { ConfigRepository } from "../repositories/ConfigRepository.js";
import {
	readConfigUseCase,
	updateConfigUseCase,
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
	it("readConfigUseCase serializes repository value to binary", () => {
		const state = create(BrowserStateSchema, {
			filters: [],
		});
		const repository = createConfigRepository({
			get: vi.fn().mockReturnValue(state),
		});

		const result = readConfigUseCase(BrowserStateSchema, repository);

		expect(repository.get).toHaveBeenCalledTimes(1);
		const decoded = fromBinary(BrowserStateSchema, result);
		expect(decoded).toMatchObject({ filters: [] });
	});

	it("updateConfigUseCase deserializes binary and updates repository", () => {
		const state = create(BrowserStateSchema, {
			filters: [],
		});
		const binary = Buffer.from(toBinary(BrowserStateSchema, state));
		const repository = createConfigRepository();

		updateConfigUseCase(BrowserStateSchema, repository, binary);

		expect(repository.update).toHaveBeenCalledTimes(1);
		expect(repository.update).toHaveBeenCalledWith(
			expect.objectContaining({ filters: [] }),
		);
	});

	it("readConfigUseCase returns valid binary round-trip", () => {
		const state = create(BrowserStateSchema, {
			filters: [],
		});
		const repository = createConfigRepository({
			get: vi.fn().mockReturnValue(state),
		});

		const binary = readConfigUseCase(BrowserStateSchema, repository);

		const decoded = fromBinary(BrowserStateSchema, binary);
		const reEncoded = Buffer.from(toBinary(BrowserStateSchema, decoded));
		expect(Buffer.from(binary).equals(reEncoded)).toBe(true);
	});

	it("updateConfigUseCase passes deserialized message to repository", () => {
		const state = create(BrowserStateSchema, {
			filters: [],
		});
		const binary = Buffer.from(toBinary(BrowserStateSchema, state));
		const updateFn = vi.fn();
		const repository = createConfigRepository({ update: updateFn });

		updateConfigUseCase(BrowserStateSchema, repository, binary);

		const passedValue = updateFn.mock.calls[0][0];
		const reEncoded = fromBinary(
			BrowserStateSchema,
			toBinary(BrowserStateSchema, passedValue),
		);
		expect(reEncoded).toMatchObject({ filters: [] });
	});
});
