import { describe, expect, it, vi } from "vitest";
import type { ViewStateBlobRepository } from "../repositories/ViewStateBlobRepository.js";
import {
	createReadViewStateBlobUseCase,
	createSaveViewStateBlobUseCase,
	createSweepViewStateBlobsUseCase,
	VIEW_STATE_BLOB_MAX_AGE_MS,
} from "./viewStateBlobUseCases.js";

const createRepository = (
	overrides?: Partial<ViewStateBlobRepository>,
): ViewStateBlobRepository => {
	return {
		get: vi.fn(),
		put: vi.fn(),
		sweep: vi.fn(),
		...overrides,
	};
};

describe("viewStateBlobUseCases", () => {
	it("save computes the token from the data and upserts it via the repository", () => {
		const repository = createRepository();
		const save = createSaveViewStateBlobUseCase(repository);

		const token = save("some-serialized-selection");

		expect(repository.put).toHaveBeenCalledTimes(1);
		expect(repository.put).toHaveBeenCalledWith(
			token,
			"some-serialized-selection",
		);
	});

	it("save is idempotent: the same data always yields the same token", () => {
		const repository = createRepository();
		const save = createSaveViewStateBlobUseCase(repository);

		const tokenA = save("same-selection");
		const tokenB = save("same-selection");

		expect(tokenA).toBe(tokenB);
	});

	it("read returns the entry's data when found", () => {
		const repository = createRepository({
			get: vi.fn().mockReturnValue({
				data: "the-data",
				createdAt: 1,
				lastAccessedAt: 2,
			}),
		});
		const read = createReadViewStateBlobUseCase(repository);

		expect(read("some-token")).toBe("the-data");
		expect(repository.get).toHaveBeenCalledWith("some-token");
	});

	it("read returns undefined when the token is unknown", () => {
		const repository = createRepository({
			get: vi.fn().mockReturnValue(undefined),
		});
		const read = createReadViewStateBlobUseCase(repository);

		expect(read("unknown-token")).toBeUndefined();
	});

	it("sweep defaults to the 90-day retention window", () => {
		const repository = createRepository({
			sweep: vi.fn().mockReturnValue(3),
		});
		const sweep = createSweepViewStateBlobsUseCase(repository);

		const removedCount = sweep();

		expect(repository.sweep).toHaveBeenCalledWith(VIEW_STATE_BLOB_MAX_AGE_MS);
		expect(removedCount).toBe(3);
	});

	it("sweep accepts an explicit maxAgeMs override", () => {
		const repository = createRepository({ sweep: vi.fn().mockReturnValue(0) });
		const sweep = createSweepViewStateBlobsUseCase(repository);

		sweep(1_000);

		expect(repository.sweep).toHaveBeenCalledWith(1_000);
	});
});
