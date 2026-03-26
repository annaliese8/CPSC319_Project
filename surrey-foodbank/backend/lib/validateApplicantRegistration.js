const ALLOWED_PROVINCES = ["british columbia"];
const ALLOWED_STATUS_IN_CANADA = [
  "canadian citizen",
  "permanent resident",
  "refugee status",
  "temporary resident",
  "international student",
  "work permit"
];
const ALLOWED_TINY_BUNDLES = ["yes", "no"];

function normalize(value) {
  return String(value || "").trim();
}

function normalizeLower(value) {
  return normalize(value).toLowerCase();
}

function readValue(body, camelKey, snakeKey) {
  const camelValue = body?.[camelKey];
  if (camelValue !== undefined && camelValue !== null && String(camelValue).trim() !== "") {
    return normalize(camelValue);
  }
  return normalize(body?.[snakeKey]);
}

function validateApplicantRegistration(body) {
  const errors = {};

  const firstName = readValue(body, "firstName", "first_name");
  const lastName = readValue(body, "lastName", "last_name");
  const streetAddress = readValue(body, "streetAddress", "street_addr");
  const city = readValue(body, "city", "city");
  const province = readValue(body, "province", "province");
  const postalCode = readValue(body, "postalCode", "postal_code");
  const phone = readValue(body, "phone", "phone");
  const statusInCanada = readValue(body, "statusInCanada", "status_in_canada");
  const householdMembers = readValue(body, "householdMembers", "household_members");
  const applyingToTinyBundles = readValue(
    body,
    "applyingToTinyBundles",
    "tiny_bundles_program",
  ) || "no";
  const language = readValue(body, "language", "language") || "English";

  if (!firstName) errors.firstName = "First name is required.";
  if (!lastName) errors.lastName = "Last name is required.";
  if (!streetAddress) errors.streetAddress = "Street address is required.";
  if (!city) errors.city = "City is required.";
  if (!postalCode) errors.postalCode = "Postal code is required.";
  if (!phone) errors.phone = "Phone is required.";
  if (!statusInCanada) errors.statusInCanada = "Status in Canada is required.";

  if (
    province &&
    !ALLOWED_PROVINCES.includes(normalizeLower(province))
  ) {
    errors.province = "Province must be British Columbia.";
  }

  if (
    statusInCanada &&
    !ALLOWED_STATUS_IN_CANADA.includes(normalizeLower(statusInCanada))
  ) {
    errors.statusInCanada = "Invalid status in Canada value.";
  }

  if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
    errors.phone = "Phone must contain 10 digits.";
  }

  const postalCompact = postalCode.replace(/\s/g, "");
  if (!/^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/.test(postalCompact)) {
    errors.postalCode = "Postal code must be in Canadian format (A1A1A1).";
  }

  if (householdMembers) {
    const membersNumber = Number(householdMembers);
    if (!Number.isInteger(membersNumber) || membersNumber <= 0) {
      errors.householdMembers = "Household members must be a positive number.";
    }
  }

  const tinyBundlesValue = normalizeLower(applyingToTinyBundles);
  if (!ALLOWED_TINY_BUNDLES.includes(tinyBundlesValue)) {
    errors.applyingToTinyBundles = "Applying to Tiny Bundles must be yes or no.";
  }

  return {
    errors,
    values: {
      first_name: firstName,
      last_name: lastName,
      street_addr: streetAddress,
      city,
      postal_code: postalCode,
      phone,
      status_in_canada: statusInCanada,
      tiny_bundles_program: tinyBundlesValue === "yes",
    },
  };
}

function isRegistrationComplete(record) {
  if (!record || typeof record !== "object") return false;

  const requiredFields = [
    "first_name",
    "last_name",
    "street_addr",
    "city",
    "postal_code",
    "phone",
    "status_in_canada",
  ];

  for (const field of requiredFields) {
    if (!normalize(record[field])) {
      return false;
    }
  }

  return true;
}

module.exports = {
  validateApplicantRegistration,
  isRegistrationComplete,
};
