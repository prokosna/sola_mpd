import { API_CONFIGS_BROWSER_STATE } from "@sola_mpd/domain/src/const/api.js";
import { BrowserState } from "@sola_mpd/domain/src/models/browser_pb.js";

import type { BrowserStateRepository } from "../../features/browser";
import type { HttpClient } from "../http/HttpClient";

/**
 * Implementation of BrowserStateRepository using HttpClient.
 */
export class BrowserStateRepositoryImplHttp implements BrowserStateRepository {
	constructor(private readonly client: HttpClient) {}

	fetch = async (): Promise<BrowserState> => {
		return this.client.get<BrowserState>(
			API_CONFIGS_BROWSER_STATE,
			BrowserState.fromBinary,
		);
	};

	save = async (browserState: BrowserState): Promise<void> => {
		return this.client.post(API_CONFIGS_BROWSER_STATE, browserState.toBinary());
	};
}
