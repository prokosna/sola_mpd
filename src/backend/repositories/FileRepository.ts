import fs from "fs";
import path from "path";

import { JSONSerializable } from "@/types/serialization";

export class FileRepository<T> {
  private localFilePath: string;
  private localCache: T;
  private tType: JSONSerializable<T>;

  constructor(
    localFilePath: string,
    defaultValue: T,
    tType: JSONSerializable<T>,
  ) {
    this.localFilePath = localFilePath;
    this.tType = tType;
    const dirPath = path.dirname(this.localFilePath);
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      const fileContent = fs.readFileSync(this.localFilePath, "utf-8");
      this.localCache = tType.fromJSON(JSON.parse(fileContent));
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
      JSON.stringify(this.tType.toJSON(this.localCache), null, 2),
      (err) => {
        if (err) {
          console.error(err);
        }
      },
    );
  }
}
