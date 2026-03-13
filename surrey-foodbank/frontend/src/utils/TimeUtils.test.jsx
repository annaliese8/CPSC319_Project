import { describe, it, expect } from "vitest";
import { addMinutesToTime } from "./TimeUtils";

describe("addMinutesToTime", () => {
    // Valid input cases
    it("adds minutes within the same hour", () => {
        expect(addMinutesToTime("09:00", 15)).toBe("09:15");
    });

    it("adds minutes and enters the next hour", () => {
        expect(addMinutesToTime("09:45", 15)).toBe("10:00");
    });

    it("adds minutes and passes multiple hours", () => {
        expect(addMinutesToTime("09:00", 150)).toBe("11:30");
    });

    it("adds minutes and adds a 0 when necessary", () => {
        expect(addMinutesToTime("09:00", 5)).toBe("09:05");
    });

    it("adds minutes following 24 hour time format", () => {
        expect(addMinutesToTime("12:45", 30)).toBe("13:15");
    });

    it("adds negative minutes to roll back time", () => {
        expect(addMinutesToTime("11:30", -15)).toBe("11:15");
    });

    it("handles passing through midnight", () => {
        expect(addMinutesToTime("23:45", 30)).toBe("00:15");
    });

    // Invalid input cases that return an empty string
    it.each([
        ["null time", null, 15],
        ["time missing a colon", "0900", 15],
        ["letters in time segment", "a0:00", 15],
        ["symbols in time segment", "!0:00", 15],
        ["other symbol instead of colon in time", "09-00", 15],
    ])("returns empty string for %s", (description, time, minutesToAdd) => {
        expect(addMinutesToTime(time, minutesToAdd)).toBe("");
    });
});
