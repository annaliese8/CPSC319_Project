/**
 * Validates the registration form fields.
 * Returns an object
 *     where the keys are the registration form field names and the values are the error messages
 *     or an empty object if valid.
 */

export const validateRegistrationForm = (form) => {
  const errors = {};

  // Helper that checks if a phone number is at least 10 digits, is at most 15 digits,
  // and contains valid characters (0-9, +, (, ), -)
  const isValidPhone = (value) => {
    if (!/^\+?[\d\s\-(). ]+$/.test(value)) return false;
    const digits = value.replace(/\D/g, "").length;
    return digits >= 10 && digits <= 15;
  };
  // Helper that checks if a postal code is letter-number-letter-number-letter-number
  const isValidPostalCode = (value) => /^[a-z]\d[a-z] ?\d[a-z]\d$/i.test(value);

  // All form fields are required
  if (!form.firstName?.trim()) errors.firstName = "Required";
  if (!form.lastName?.trim()) errors.lastName = "Required";
  if (!form.streetAddress?.trim()) errors.streetAddress = "Required";
  if (!form.city?.trim()) errors.city = "Required";
  if (!form.province?.trim()) errors.province = "Required";
  if (!form.postalCode?.trim()) errors.postalCode = "Required (e.g. A1A 1A1)";
  else if (!isValidPostalCode(form.postalCode))
    errors.postalCode = "Please enter a valid postal code (e.g. A1A 1A1)";
  if (!form.phone?.trim()) errors.phone = "Required (at least 10 digits)";
  else if (!isValidPhone(form.phone))
    errors.phone = "Please enter a valid phone number (at least 10 digits)";
  if (!form.statusInCanada?.trim()) errors.statusInCanada = "Required";
  if (!form.language?.trim()) errors.language = "Required";

  return errors;
};

// Used Claude to help write regex for validation and to debug
