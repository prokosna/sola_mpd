import fs from "node:fs";
import path from "node:path";

import type { JsonObject, Message } from "@bufbuild/protobuf";

export class FileRepository<T extends Message<T>> {
	private localCache: T;

	constructor(
		private localFilePath: string,
		defaultValue: T,
	) {
		this.localFilePath = localFilePath;
		const dirPath = path.dirname(this.localFilePath);
		try {
			fs.mkdirSync(dirPath, { recursive: true });
			const fileContent = fs.readFileSync(this.localFilePath, "utf-8");

			// Make sure that the local cache has all the latest necessary fields.
			// Otherwise, copy the field from the default value.
			const defaultValueJson = defaultValue.toJson();
			const fileContentJson = JSON.parse(fileContent);
			for (const [key, value] of Object.entries(
				defaultValueJson as JsonObject,
			)) {
				if (!(key in fileContentJson)) {
					fileContentJson[key] = value;
				}
			}
			this.localCache = defaultValue.getType().fromJson(fileContentJson);
		} catch (_) {
			this.localCache = defaultValue;
			this.save();
		}
	}

	get(): T {
		return this.localCache;
	}

	update(value: T) {
		this.localCache = value;
		this.save();
	}

	private save() {
		fs.writeFile(
			this.localFilePath,
			JSON.stringify(this.localCache.toJson(), null, 2),
			(err) => {
				if (err) {
					console.error(err);
				}
			},
		);
	}
}
