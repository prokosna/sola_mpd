import { create } from "@bufbuild/protobuf";
import { FolderSchema } from "@sola_mpd/shared/src/models/file_explore_pb.js";
import { describe, expect, it } from "vitest";

import { buildFolderTree } from "./fileExploreTree";

function createFolder(path: string) {
	return create(FolderSchema, { path });
}

describe("fileExploreTree", () => {
	describe("buildFolderTree", () => {
		it("should return empty array for empty input", () => {
			expect(buildFolderTree([], undefined)).toEqual([]);
		});

		it("should build root-level nodes", () => {
			const folders = [createFolder("Music"), createFolder("Videos")];
			const result = buildFolderTree(folders, undefined);
			expect(result).toHaveLength(2);
			expect(result[0].label).toBe("Music");
			expect(result[1].label).toBe("Videos");
		});

		it("should nest child folders under parents", () => {
			const folders = [
				createFolder("Music"),
				createFolder("Music/Rock"),
				createFolder("Music/Jazz"),
			];
			const result = buildFolderTree(folders, undefined);
			expect(result).toHaveLength(1);
			expect(result[0].children).toHaveLength(2);
			expect(result[0].children[0].label).toBe("Rock");
			expect(result[0].children[1].label).toBe("Jazz");
		});

		it("should mark selected node", () => {
			const folders = [createFolder("Music"), createFolder("Music/Rock")];
			const result = buildFolderTree(folders, "Music/Rock");
			expect(result[0].isSelected).toBe(false);
			expect(result[0].children[0].isSelected).toBe(true);
		});

		it("should handle deep nesting", () => {
			const folders = [
				createFolder("A"),
				createFolder("A/B"),
				createFolder("A/B/C"),
			];
			const result = buildFolderTree(folders, undefined);
			expect(result[0].children[0].children[0].label).toBe("C");
		});
	});
});
