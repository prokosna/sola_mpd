import fs from "node:fs";
import path from "node:path";

import {
	fromJson,
	type JsonObject,
	type Message,
	toJson,
} from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";

export class FileRepository<T extends Message> {
	private localCache: T;

	constructor(
		private localFilePath: string,
		private schema: GenMessage<T>,
		defaultValue: T,
	) {
		this.localFilePath = localFilePath;
		const dirPath = path.dirname(this.localFilePath);
		try {
			fs.mkdirSync(dirPath, { recursive: true });
			const fileContent = fs.readFileSync(this.localFilePath, "utf-8");

			// Make sure that the local cache has all the latest necessary fields.
			// Otherwise, copy the field from the default value.
			const defaultValueJson = toJson(schema, defaultValue);
			const fileContentJson = JSON.parse(fileContent);
			for (const [key, value] of Object.entries(
				defaultValueJson as JsonObject,
			)) {
				if (!(key in fileContentJson)) {
					fileContentJson[key] = value;
				}
			}
			this.localCache = fromJson(schema, fileContentJson);
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
			JSON.stringify(toJson(this.schema, this.localCache), null, 2),
			(err) => {
				if (err) {
					console.error(err);
				}
			},
		);
	}
}
