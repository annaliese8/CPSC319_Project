export const validateRegistrationForm = (form) => {
  const errors = {};

  const isValidPhone = (value) => value.replace(/\D/g, "").length >= 10;
  if (!form.firstName.trim()) errors.firstName = "Required";
  if (!form.lastName.trim()) errors.lastName = "Required";
  if (!form.streetAddress.trim()) errors.streetAddress = "Required";
  if (!form.city.trim()) errors.city = "Required";
  if (!form.province) errors.province = "Required";
  if (!/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(form.postalCode))
    errors.postalCode = "Please enter a valid postal code (e.g. A1A 1A1)";
  if (!form.phone.trim()) errors.phone = "Required";
  else if (!isValidPhone(form.phone))
    errors.phone = "Please enter a valid phone number (at least 10 digits)";
  if (!form.statusInCanada) errors.statusInCanada = "Required";
  if (!form.householdMembers || Number(form.householdMembers) < 1)
    errors.householdMembers = "Please enter a valid household size (1 or more)";
  if (!form.language.trim()) errors.language = "Required";

  return errors;
};
