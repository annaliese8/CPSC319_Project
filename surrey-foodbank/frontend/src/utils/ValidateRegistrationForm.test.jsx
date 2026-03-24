/**
 * Tests for the ValidateRegistrationForm.jsx utility
 */

import { describe, it, expect } from "vitest";
import { validateRegistrationForm } from "./ValidateRegistrationForm";

const validForm = {
  firstName: "John",
  lastName: "Doe",
  streetAddress: "123 Main Street",
  city: "Surrey",
  province: "British Columbia",
  postalCode: "A1A 1A1",
  phone: "604-123-4567",
  statusInCanada: "Canadian Citizen",
  language: "English",
};

describe("validateRegistrationForm", () => {
  // Entire Form Tests
  it("returns no errors for a valid form", () => {
    expect(validateRegistrationForm(validForm)).toEqual({});
  });
  it("requires all fields, and error messages of blank fields contain the word 'required'", () => {
    const errors = validateRegistrationForm({
      firstName: "",
      lastName: "",
      streetAddress: "",
      city: "",
      postalCode: "",
      province: "",
      phone: "",
      statusInCanada: "",
      language: "",
    });
    expect(errors.firstName).toMatch(/required/i);
    expect(errors.lastName).toMatch(/required/i);
    expect(errors.streetAddress).toMatch(/required/i);
    expect(errors.city).toMatch(/required/i);
    expect(errors.postalCode).toMatch(/required/i);
    expect(errors.province).toMatch(/required/i);
    expect(errors.phone).toMatch(/required/i);
    expect(errors.statusInCanada).toMatch(/required/i);
    expect(errors.language).toMatch(/required/i);
  });

  // Postal Code Tests
  it.each([
    ["accepts postal codes with a space", "V3R 7C3"],
    ["accepts postal codes without space", "V3R7C3"],
    ["accepts postal codes with lower case letters", "v3r7c3"],
  ])("%s: %s", (description, postalCode) => {
    const result = validateRegistrationForm({ ...validForm, postalCode });
    expect(result.postalCode).toBeUndefined();
  });
  it.each([
    ["rejects American ZIP codes", "90210"],
    ["rejects postal codes that are too long", "A1A1A1A"],
    ["rejects postal codes that are too short", "A1A1A"],
    ["rejects postal codes that are #A# A#A", "1A1A1A"],
    ["rejects postal codes that are null", null],
  ])("%s: %s", (description, postalCode) => {
    const result = validateRegistrationForm({ ...validForm, postalCode });
    expect(result.postalCode).toBeDefined();
  });

  // Phone Number Tests
  it.each([
    ["accepts phone numbers with 10 digits", "1234567890"],
    ["accepts phone numbers with 15 digits", "123456789012345"],
    ["accepts phone numbers with a plus at the start", "+1234567890"],
    ["accepts phone numbers with spaces", "12 34 56 7890"],
    ["accepts phone numbers with dashes", "123-456-7890"],
    ["accepts phone numbers with parenthesis", "(123)4567890"],
    [
      "accepts phone numbers with spaces parenthesis and dashes",
      "(123) 456-7890",
    ],
  ])("%s: %s", (description, phone) => {
    const result = validateRegistrationForm({ ...validForm, phone });
    expect(result.phone).toBeUndefined();
  });
  it.each([
    ["rejects phone numbers with less than 10 digits", "123456789"],
    ["rejects phone numbers with more than 15 digits", "1234567890123456"],
    ["rejects phone numbers with letters", "a123456789"],
    ["rejects phone numbers with symbols that arent + - ( )", "#123456789"],
    ["rejects phone numbers that are null", null],
  ])("%s: %s", (description, phone) => {
    const result = validateRegistrationForm({ ...validForm, phone });
    expect(result.phone).toBeDefined();
  });
});

// Used Claude to help with formatting and debugging
