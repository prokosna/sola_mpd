import { create } from "@bufbuild/protobuf";
import {
	AudioFormat_Encoding,
	AudioFormatSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { classifyAudioFormat } from "./playerFormat";

describe("playerFormat", () => {
	describe("classifyAudioFormat", () => {
		it("should return defaults when format is undefined", () => {
			const result = classifyAudioFormat(undefined);
			expect(result.isHiRes).toBe(false);
			expect(result.isDsd).toBe(false);
			expect(result.formatString).toBe("");
		});

		it("should classify DSD as hi-res", () => {
			const format = create(AudioFormatSchema, {
				encoding: AudioFormat_Encoding.DSD,
				samplingRate: 2822400,
				bits: 1,
				channels: 2,
			});
			const result = classifyAudioFormat(format);
			expect(result.isHiRes).toBe(true);
			expect(result.isDsd).toBe(true);
		});

		it("should classify high sample rate PCM as hi-res", () => {
			const format = create(AudioFormatSchema, {
				encoding: AudioFormat_Encoding.PCM,
				samplingRate: 96000,
				bits: 16,
				channels: 2,
			});
			const result = classifyAudioFormat(format);
			expect(result.isHiRes).toBe(true);
			expect(result.isDsd).toBe(false);
		});

		it("should classify high bit depth PCM as hi-res", () => {
			const format = create(AudioFormatSchema, {
				encoding: AudioFormat_Encoding.PCM,
				samplingRate: 44100,
				bits: 24,
				channels: 2,
			});
			const result = classifyAudioFormat(format);
			expect(result.isHiRes).toBe(true);
			expect(result.isDsd).toBe(false);
		});

		it("should classify standard PCM as non-hi-res", () => {
			const format = create(AudioFormatSchema, {
				encoding: AudioFormat_Encoding.PCM,
				samplingRate: 44100,
				bits: 16,
				channels: 2,
			});
			const result = classifyAudioFormat(format);
			expect(result.isHiRes).toBe(false);
			expect(result.isDsd).toBe(false);
		});
	});
});
