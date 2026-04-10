import { create } from "@bufbuild/protobuf";
import {
	type MpdProfile,
	MpdProfileSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { describe, expect, it } from "vitest";

import {
	buildConsumeCommand,
	buildNextCommand,
	buildPauseCommand,
	buildPreviousCommand,
	buildRandomCommand,
	buildRepeatCommand,
	buildSeekCommand,
	buildSetVolumeCommand,
	buildStopCommand,
} from "./playerCommand";

function createProfile(): MpdProfile {
	return create(MpdProfileSchema, {
		name: "test",
		host: "localhost",
		port: 6600,
	});
}

describe("playerCommand", () => {
	it("buildPauseCommand should create pause command", () => {
		const cmd = buildPauseCommand(createProfile(), true);
		expect(cmd.command.case).toBe("pause");
		if (cmd.command.case === "pause") {
			expect(cmd.command.value.pause).toBe(true);
		}
	});

	it("buildPauseCommand should create resume command", () => {
		const cmd = buildPauseCommand(createProfile(), false);
		if (cmd.command.case === "pause") {
			expect(cmd.command.value.pause).toBe(false);
		}
	});

	it("buildStopCommand should create stop command", () => {
		const cmd = buildStopCommand(createProfile());
		expect(cmd.command.case).toBe("stop");
	});

	it("buildNextCommand should create next command", () => {
		const cmd = buildNextCommand(createProfile());
		expect(cmd.command.case).toBe("next");
	});

	it("buildPreviousCommand should create previous command", () => {
		const cmd = buildPreviousCommand(createProfile());
		expect(cmd.command.case).toBe("previous");
	});

	it("buildRandomCommand should create random command", () => {
		const cmd = buildRandomCommand(createProfile(), true);
		expect(cmd.command.case).toBe("random");
		if (cmd.command.case === "random") {
			expect(cmd.command.value.enable).toBe(true);
		}
	});

	it("buildRepeatCommand should create repeat command", () => {
		const cmd = buildRepeatCommand(createProfile(), false);
		expect(cmd.command.case).toBe("repeat");
		if (cmd.command.case === "repeat") {
			expect(cmd.command.value.enable).toBe(false);
		}
	});

	it("buildConsumeCommand should create consume command", () => {
		const cmd = buildConsumeCommand(createProfile(), true);
		expect(cmd.command.case).toBe("consume");
		if (cmd.command.case === "consume") {
			expect(cmd.command.value.enable).toBe(true);
		}
	});

	it("buildSetVolumeCommand should create setvol command", () => {
		const cmd = buildSetVolumeCommand(createProfile(), 75);
		expect(cmd.command.case).toBe("setvol");
		if (cmd.command.case === "setvol") {
			expect(cmd.command.value.vol).toBe(75);
		}
	});

	it("buildSeekCommand should create seek command", () => {
		const cmd = buildSeekCommand(createProfile(), 42.5);
		expect(cmd.command.case).toBe("seek");
		if (cmd.command.case === "seek") {
			expect(cmd.command.value.time).toBe(42.5);
			expect(cmd.command.value.target.case).toBe("current");
		}
	});
});
