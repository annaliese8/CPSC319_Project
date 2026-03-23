/**
 * Validates the household members list.
 * Returns an object
 *     where the keys are the member IDs and the values are objects of field error messages,
 *     or an empty object if valid.
 */
export const validateHouseholdMembers = (householdMembers) => {
  const errors = {};
  householdMembers.forEach((m) => {
    const mErr = {};
    if (!m.firstName?.trim()) mErr.firstName = "Required";
    if (!m.lastName?.trim()) mErr.lastName = "Required";
    if (!m.ageGroup) mErr.ageGroup = "Please select an age group";
    if (Object.keys(mErr).length) errors[m.id] = mErr;
  });
  return errors;
};

// Claude.ai was used in the making of this validation function
