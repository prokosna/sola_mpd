import { describe, it, expect } from "vitest";

import { displayDuration, normalize } from "./stringUtils.js";

describe("stringUtils", () => {
  describe("displayDuration", () => {
    it("should format seconds only", () => {
      expect(displayDuration(5)).toBe("00:05");
      expect(displayDuration(45)).toBe("00:45");
    });

    it("should format minutes and seconds", () => {
      expect(displayDuration(65)).toBe("01:05");
      expect(displayDuration(3599)).toBe("59:59");
    });

    it("should format hours, minutes and seconds", () => {
      expect(displayDuration(3600)).toBe("01:00:00");
      expect(displayDuration(3661)).toBe("01:01:01");
      expect(displayDuration(86399)).toBe("23:59:59");
    });

    it("should format days, hours, minutes and seconds", () => {
      expect(displayDuration(86400)).toBe("1:00:00:00");
      expect(displayDuration(90061)).toBe("1:01:01:01");
      expect(displayDuration(172800)).toBe("2:00:00:00");
    });

    it("should handle zero duration", () => {
      expect(displayDuration(0)).toBe("00:00");
    });

    it("should handle floating point numbers", () => {
      expect(displayDuration(65.4)).toBe("01:05");
      expect(displayDuration(65.8)).toBe("01:05");
    });
  });

  describe("normalize", () => {
    it("should convert to lowercase", () => {
      expect(normalize("Hello World")).toBe("hello world");
      expect(normalize("UPPER CASE")).toBe("upper case");
    });

    it("should remove diacritics", () => {
      expect(normalize("café")).toBe("cafe");
      expect(normalize("naïve")).toBe("naive");
      expect(normalize("piñata")).toBe("pinata");
      expect(normalize("über")).toBe("uber");
    });

    it("should handle mixed case and diacritics", () => {
      expect(normalize("CAFÉ")).toBe("cafe");
      expect(normalize("Über")).toBe("uber");
    });

    it("should handle empty string", () => {
      expect(normalize("")).toBe("");
    });

    it("should handle string with no diacritics", () => {
      expect(normalize("hello")).toBe("hello");
      expect(normalize("123")).toBe("123");
    });

    it("should handle multiple diacritics in one character", () => {
      // ấ has both acute and circumflex
      expect(normalize("ấ")).toBe("a");
    });
  });
});
