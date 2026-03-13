/**
 * Adds minutes to a time string in "H:MM" format.
 * Returns the resulting time string, or "" if the input is invalid.
 */

export const addMinutesToTime = (time, minutesToAdd) => {
    if (!time || !time.includes(":")) return "";
    const [hour, minute] = time.split(":").map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return "";
    const totalMinutes = (hour * 60 + minute + minutesToAdd) % (24 * 60);
    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;
    return `${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`;
};