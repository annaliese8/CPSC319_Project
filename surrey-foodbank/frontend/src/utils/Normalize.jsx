// Normalize a city string for comparison
export const normalizeCity = (city) => {
    return city
        ?.toLowerCase()
        .trim()
        .replace(/[^a-z\s]/g, "") // remove punctuation
        .replace(/\s+/g, " ");    // collapse multiple spaces
};