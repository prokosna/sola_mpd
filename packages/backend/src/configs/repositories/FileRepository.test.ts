import fs from "node:fs";

import { Message } from "@bufbuild/protobuf";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FileRepository } from "./FileRepository.js";

vi.mock("fs");
vi.mock("path");

class MockMessage extends Message<MockMessage> {
	toJson() {
		return {};
	}

	static fromJson() {
		return new MockMessage();
	}
}

describe("FileRepository", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should initialize with default value if file does not exist", () => {
		const defaultValue = new MockMessage();
		vi.spyOn(fs, "readFileSync").mockImplementation(() => {
			throw new Error("File not found");
		});
		const repo = new FileRepository<MockMessage>("path/to/file", defaultValue);

		expect(repo.get()).toBe(defaultValue);
	});

	it("should read from file if file exists", () => {
		const fileContent = '{"key": "value"}';
		vi.spyOn(fs, "readFileSync").mockReturnValue(fileContent);
		vi.spyOn(MockMessage, "fromJson").mockReturnValue(new MockMessage());

		const repo = new FileRepository<MockMessage>(
			"path/to/file",
			new MockMessage(),
		);

		expect(MockMessage.fromJson).toHaveBeenCalledWith(JSON.parse(fileContent));
	});

	it("should update local cache and save to file", () => {
		const defaultValue = new MockMessage();
		const repo = new FileRepository<MockMessage>("path/to/file", defaultValue);
		const newValue = new MockMessage();

		repo.update(newValue);

		expect(repo.get()).toBe(newValue);
		expect(fs.writeFile).toHaveBeenCalledWith(
			"path/to/file",
			JSON.stringify(newValue.toJson(), null, 2),
			expect.any(Function),
		);
	});
});
