import { create } from "@bufbuild/protobuf";
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
	it("readConfigUseCase returns the repository value", () => {
		const state = create(BrowserStateSchema, { filters: [] });
		const repository = createConfigRepository({
			get: vi.fn().mockReturnValue(state),
		});

		const result = readConfigUseCase(repository);

		expect(repository.get).toHaveBeenCalledTimes(1);
		expect(result).toBe(state);
	});

	it("updateConfigUseCase stores the given value", () => {
		const state = create(BrowserStateSchema, { filters: [] });
		const repository = createConfigRepository();

		updateConfigUseCase(repository, state);

		expect(repository.update).toHaveBeenCalledTimes(1);
		expect(repository.update).toHaveBeenCalledWith(state);
	});
});
