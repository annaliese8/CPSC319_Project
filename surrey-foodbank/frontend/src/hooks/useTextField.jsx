// Copilot was used to help create this hook and reduce repeated form logic

import { useState } from "react";

/**
 * Reusable hook for managing a text field with validation.
 * Stores value + error state and runs the provided validator function
 *
 * Parameters:
 * initialValue: The starting value of the field
 * validator: A function that takes the field value and returns:
 *     - An empty string if the value is valid
 *     - An error message string if the value is invalid
 *
 * Returns:
 * - value: current field value
 * - onChange: function that updates the field when its value changes
 * - errorMessage: validation error message
 * - isInvalid: boolean indicating if there is an error
 * - validate: function to manually trigger validation (e.g., on form submit)
 */

export default function useTextField(initialValue, validator) {
  const [value, setValue] = useState(initialValue);
  const [errorMessage, setErrorMessage] = useState("");

  const onChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    validate(newValue);
  };

  const validate = (val = value) => {
    const message = validator(val);
    setErrorMessage(message);
    return message;
  };

  return {
    value,
    onChange,
    errorMessage,
    isInvalid: Boolean(errorMessage),
    validate,
  };
}
