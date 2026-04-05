import { fromBinary, toBinary } from "@bufbuild/protobuf";
import { API_CONFIGS_BROWSER_STATE } from "@sola_mpd/shared/src/const/api.js";
import {
	type BrowserState,
	BrowserStateSchema,
} from "@sola_mpd/shared/src/models/browser_pb.js";
import type { HttpClient } from "../../../../lib/http/HttpClient";
import type { BrowserStateRepository } from "./BrowserStateRepository";

export class BrowserStateRepositoryHttp implements BrowserStateRepository {
	constructor(private readonly client: HttpClient) {}

	fetch = async (): Promise<BrowserState> => {
		return this.client.get<BrowserState>(API_CONFIGS_BROWSER_STATE, (bytes) =>
			fromBinary(BrowserStateSchema, bytes),
		);
	};

	save = async (browserState: BrowserState): Promise<void> => {
		return this.client.post(
			API_CONFIGS_BROWSER_STATE,
			toBinary(BrowserStateSchema, browserState),
		);
	};
}
