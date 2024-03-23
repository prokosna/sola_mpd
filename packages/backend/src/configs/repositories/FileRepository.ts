import fs from "fs";
import path from "path";

import { Message } from "@bufbuild/protobuf";

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
      this.localCache = defaultValue
        .getType()
        .fromJson(JSON.parse(fileContent));
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
