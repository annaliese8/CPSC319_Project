/**
 * Form fields for the applicant registration form.
 * Used in the applicant booking flow, the profile page, and the staff booking panel.
 */

import {
  Autocomplete,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";

export const STATUS_OPTIONS = [
  "Canadian Citizen",
  "Permanent Resident",
  "Refugee/Protected Person",
  "Temporary Resident (6 months+)",
];

export const LANGUAGES = [
  "English",
  "Arabic",
  "Bengali",
  "Cantonese",
  "Farsi",
  "French",
  "German",
  "Hindi",
  "Japanese",
  "Korean",
  "Mandarin",
  "Portuguese",
  "Punjabi",
  "Rohingya",
  "Spanish",
  "Swahili",
  "Tagalog",
  "Tigrinya",
  "Vietnamese",
];

export const CANADIAN_PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland",
  "Nova Scotia",
  "Northwest Territories",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon Territories",
];

export default function RegistrationFields({
  form,
  onChange,
  errors = {},
  isDisabled = false,
}) {
  return (
    <Stack spacing={2}>
      {/* First Name */}
      <Stack direction="row" spacing={2}>
        <TextField
          label="First Name"
          value={form.firstName}
          error={!!errors.firstName}
          helperText={errors.firstName || "eg. John"}
          disabled={isDisabled}
          fullWidth
          size="small"
          required
          onChange={onChange("firstName")}
        />
        {/* Last Name */}
        <TextField
          label="Last Name"
          value={form.lastName}
          error={!!errors.lastName}
          helperText={errors.lastName || "eg. Doe"}
          disabled={isDisabled}
          fullWidth
          size="small"
          required
          onChange={onChange("lastName")}
        />
      </Stack>

      {/* Street Address */}
      <TextField
        label="Street Address"
        value={form.streetAddress}
        error={!!errors.streetAddress}
        helperText={errors.streetAddress || "eg. 123 Main Street"}
        disabled={isDisabled}
        fullWidth
        size="small"
        required
        onChange={onChange("streetAddress")}
      />
      {/* City */}
      <Stack direction="row" spacing={2}>
        <TextField
          label="City"
          value={form.city}
          error={!!errors.city}
          helperText={errors.city || "eg. Surrey"}
          disabled={isDisabled}
          fullWidth
          size="small"
          required
          onChange={onChange("city")}
        />
        {/* Postal Code */}
        <TextField
          label="Postal Code"
          value={form.postalCode}
          error={!!errors.postalCode}
          helperText={errors.postalCode || "eg. A1A 1A1"}
          disabled={isDisabled}
          fullWidth
          size="small"
          required
          onChange={onChange("postalCode")}
        />
      </Stack>

      <Stack direction="row" spacing={2}>
        {/* Province */}
        <FormControl
          disabled={isDisabled}
          fullWidth
          size="small"
          required
          error={!!errors.province}
        >
          <InputLabel>Province</InputLabel>
          <Select
            value={form.province}
            label="Province"
            onChange={onChange("province")}
          >
            {CANADIAN_PROVINCES.map((province) => (
              <MenuItem key={province} value={province}>
                {province}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.province || ""}</FormHelperText>
        </FormControl>
        {/* Phone Number */}
        <TextField
          label="Phone Number"
          value={form.phone}
          error={!!errors.phone}
          helperText={errors.phone || "eg. 604-123-4567"}
          disabled={isDisabled}
          fullWidth
          size="small"
          required
          onChange={onChange("phone")}
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        {/* Language */}
        <Autocomplete
          options={LANGUAGES}
          value={form.language}
          disabled={isDisabled}
          onChange={(_, newValue) =>
            onChange("language")({ target: { value: newValue ?? "" } })
          }
          onInputChange={(_, newInputValue) =>
            onChange("language")({ target: { value: newInputValue } })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Language"
              error={!!errors.language}
              helperText={errors.language}
              fullWidth
              required
            />
          )}
          size="small"
          fullWidth
          autoHighlight
          freeSolo
        />
        {/* Status in Canada */}
        <FormControl
          disabled={isDisabled}
          fullWidth
          size="small"
          required
          error={!!errors.statusInCanada}
        >
          <InputLabel>Status in Canada</InputLabel>
          <Select
            value={form.statusInCanada}
            label="Status in Canada"
            onChange={onChange("statusInCanada")}
          >
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.statusInCanada || ""}</FormHelperText>
        </FormControl>
      </Stack>
      {/* Tiny Bundles */}
      <FormControl>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            display: "flex",
            alignItems: "center",
            color: isDisabled ? "text.disabled" : "text.primary",
          }}
        >
          <FormLabel>
            Would you like to signup for the Tiny Bundles Program?
          </FormLabel>
          <Tooltip
            title="Select 'Yes' if your household has a pregnant mom or children under 12 months old.
                          Tiny Bundles households receive food every week instead of every two weeks. They are also
                          supplied with fresh eggs and milk while pregnant or nursing. Additional fresh vegetables
                          and other nutritional items are supplied when available."
            disableHoverListener={isDisabled}
            disableFocusListener={isDisabled}
            arrow
            slotProps={{
              tooltip: {
                sx: {
                  fontSize: "1rem",
                  maxWidth: 300,
                  p: 2,
                  backgroundColor: "primary.main",
                },
              },
              arrow: {
                sx: {
                  color: "primary.main",
                },
              },
            }}
          >
            <Link
              href="https://surreyfoodbank.org/program/babies-toddlers/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Learn more about the Tiny Bundles program"
            >
              <InfoIcon
                sx={{
                  fontSize: 20,
                  cursor: "pointer",
                  color: isDisabled ? "text.disabled" : "primary.main",
                }}
              />
            </Link>
          </Tooltip>
          <RadioGroup
            row
            value={form.applyingToTinyBundles || "no"}
            onChange={onChange("applyingToTinyBundles")}
          >
            <FormControlLabel
              value="yes"
              control={<Radio />}
              label="Yes"
              disabled={isDisabled}
            />
            <FormControlLabel
              value="no"
              control={<Radio />}
              label="No"
              disabled={isDisabled}
            />
          </RadioGroup>
        </Stack>
      </FormControl>
    </Stack>
  );
}
