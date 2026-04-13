import { create, toBinary } from "@bufbuild/protobuf";
import { AdvancedSearchResponseSchema } from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { PluginRegisterResponseWrapperSchema } from "@sola_mpd/shared/src/models/plugin/plugin_wrapper_pb.js";

import { toErrorMessage } from "./errorUtils.js";

export const createMpdErrorBuffer = (err: unknown): Uint8Array => {
	return toBinary(
		MpdResponseSchema,
		create(MpdResponseSchema, {
			command: {
				case: "error",
				value: { message: toErrorMessage(err) },
			},
		}),
	);
};

export const createPluginRegisterErrorBuffer = (err: unknown): Uint8Array => {
	return toBinary(
		PluginRegisterResponseWrapperSchema,
		create(PluginRegisterResponseWrapperSchema, {
			result: {
				case: "error",
				value: toErrorMessage(err),
			},
		}),
	);
};

export const createAdvancedSearchErrorBuffer = (err: unknown): Uint8Array => {
	return toBinary(
		AdvancedSearchResponseSchema,
		create(AdvancedSearchResponseSchema, {
			command: {
				case: "error",
				value: toErrorMessage(err),
			},
		}),
	);
};
