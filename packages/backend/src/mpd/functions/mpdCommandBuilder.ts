import { toJsonString } from "@bufbuild/protobuf";
import {
	buildSearchSortTokens,
	buildSearchWindowTokens,
	convertConditionsToString,
	convertSongMetadataTagToMpdTag,
} from "@sola_mpd/shared/src/functions/mpdConverters.js";
import {
	type MpdRequest,
	MpdRequestSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";

export type MpdCommandSpec = {
	name: string;
	args: (string | number)[];
};

function cmd(name: string, ...args: (string | number)[]): MpdCommandSpec {
	return { name, args };
}

function unsupportedCommandError(req: MpdRequest): Error {
	return new Error(
		`Unsupported command: ${toJsonString(MpdRequestSchema, req)}`,
	);
}

export function buildMpdCommand(req: MpdRequest): MpdCommandSpec {
	switch (req.command?.case) {
		case "ping":
			return cmd("ping");

		case "next":
			return cmd("next");
		case "pause":
			return cmd("pause", req.command.value.pause ? "1" : "0");
		case "play":
			switch (req.command.value.target.case) {
				case "id":
					return cmd("playid", req.command.value.target.value);
				case "pos":
					return cmd("play", req.command.value.target.value);
				default:
					return cmd("play");
			}
		case "previous":
			return cmd("previous");
		case "seek": {
			const time = String(req.command.value.time);
			switch (req.command.value.target.case) {
				case "id":
					return cmd("seekid", req.command.value.target.value, time);
				case "pos":
					return cmd("seek", req.command.value.target.value, time);
				case "current":
					return cmd("seekcur", time);
				default:
					throw unsupportedCommandError(req);
			}
		}
		case "stop":
			return cmd("stop");

		case "consume":
			return cmd("consume", req.command.value.enable ? "1" : "0");
		case "random":
			return cmd("random", req.command.value.enable ? "1" : "0");
		case "repeat":
			return cmd("repeat", req.command.value.enable ? "1" : "0");
		case "setvol":
			return cmd("setvol", String(req.command.value.vol));
		case "getvol":
			return cmd("getvol");
		case "single":
			return cmd("single", req.command.value.enable ? "1" : "0");

		case "currentsong":
			return cmd("currentsong");
		case "status":
			return cmd("status");
		case "stats":
			return cmd("stats");

		case "add":
			return cmd("add", req.command.value.uri);
		case "clear":
			return cmd("clear");
		case "delete":
			switch (req.command.value.target.case) {
				case "id":
					return cmd("deleteid", req.command.value.target.value);
				case "pos":
					return cmd("delete", req.command.value.target.value);
				default:
					throw unsupportedCommandError(req);
			}
		case "move": {
			const to = req.command.value.to;
			switch (req.command.value.from.case) {
				case "fromId":
					return cmd("moveid", req.command.value.from.value, to);
				case "fromPos":
					return cmd("move", req.command.value.from.value, to);
				default:
					throw unsupportedCommandError(req);
			}
		}
		case "playlistinfo":
			return cmd("playlistinfo");
		case "shuffle":
			return cmd("shuffle");

		case "listplaylistinfo":
			return cmd("listplaylistinfo", req.command.value.name);
		case "listplaylists":
			return cmd("listplaylists");
		case "playlistadd":
			return cmd("playlistadd", req.command.value.name, req.command.value.uri);
		case "playlistclear":
			return cmd("playlistclear", req.command.value.name);
		case "playlistdelete":
			return cmd(
				"playlistdelete",
				req.command.value.name,
				req.command.value.pos,
			);
		case "playlistmove":
			return cmd(
				"playlistmove",
				req.command.value.name,
				req.command.value.from,
				req.command.value.to,
			);
		case "rename":
			return cmd("rename", req.command.value.name, req.command.value.newName);
		case "rm":
			return cmd("rm", req.command.value.name);
		case "save":
			return cmd("save", req.command.value.name);
		case "load":
			return cmd("load", req.command.value.name);

		case "list": {
			const tag = convertSongMetadataTagToMpdTag(req.command.value.tag);
			const expression = convertConditionsToString(
				req.command.value.conditions,
			);
			return expression === ""
				? cmd("list", tag)
				: cmd("list", tag, expression);
		}
		case "search": {
			// MPD's `search` requires an expression; `(base "")` matches all songs.
			const expression =
				convertConditionsToString(req.command.value.conditions) || '(base "")';
			const sortTokens = buildSearchSortTokens(req.command.value.sort);
			const windowTokens = buildSearchWindowTokens(req.command.value.window);
			return cmd("search", expression, ...sortTokens, ...windowTokens);
		}
		case "update":
			return cmd("update");

		case "outputs":
			return cmd("outputs");

		case "listAllSongs":
			return cmd("listallinfo");
		case "listAllFolders":
			return cmd("listall");
		case "listSongsInFolder": {
			const folder = req.command.value.folder;
			if (folder === undefined) {
				throw new Error("Folder is undefined for listSongsInFolder");
			}
			return cmd("lsinfo", folder.path);
		}

		default:
			throw unsupportedCommandError(req);
	}
}
