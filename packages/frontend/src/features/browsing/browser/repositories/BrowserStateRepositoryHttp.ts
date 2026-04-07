import { API_CONFIGS_BROWSER_STATE } from "@sola_mpd/shared/src/const/api.js";
import type { BrowserState } from "@sola_mpd/shared/src/models/browser_pb.js";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import type { HttpClient } from "../../../../lib/http/HttpClient";
import { StateRepositoryHttp } from "../../../common/repositories/StateRepositoryHttp";

export class BrowserStateRepositoryHttp extends StateRepositoryHttp<BrowserState> {
	constructor(client: HttpClient) {
		super(client, API_CONFIGS_BROWSER_STATE, BrowserStateSchema);
	}
}
