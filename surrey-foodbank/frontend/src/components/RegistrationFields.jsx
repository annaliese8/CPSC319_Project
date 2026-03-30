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

export const ELIGIBLE_STATUS_OPTIONS = [
  "Canadian Citizen",
  "Permanent Resident",
  "Refugee/Protected Person",
  "Temporary Resident (over 6 months)",
];

export const INELIGIBLE_STATUS_OPTIONS = [
  "Temporary Resident (under 6 months)",
  "Visitor"
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
  isStaffPage
}) {

  const status_options = isStaffPage
    ? ELIGIBLE_STATUS_OPTIONS
    : [...ELIGIBLE_STATUS_OPTIONS, ...INELIGIBLE_STATUS_OPTIONS];

  return (
    <Stack spacing={2}>
      {/* First Name / Last Name */}
      <Stack direction="row" spacing={2}>
        <TextField
          label="First Name"
          value={form.first_name ?? ""}
          error={!!errors.first_name}
          helperText={
            isDisabled
              ? ""
              : errors.first_name || "eg. John"
          }
          disabled={isDisabled}
          fullWidth
          size="small"
          required
          onChange={onChange("first_name")}
        />
        <TextField
          label="Last Name"
          value={form.last_name ?? ""}
          error={!!errors.last_name}
          helperText={
            isDisabled
              ? ""
              : errors.last_name || "eg. Doe"
          }
          disabled={isDisabled}
          fullWidth
          size="small"
          required
          onChange={onChange("last_name")}
        />
      </Stack>

      {/* Street Address */}
      <TextField
        label="Street Address"
        value={form.street_addr ?? ""}
        error={!!errors.street_addr}
        helperText={
          isDisabled
            ? ""
            : errors.street_addr || "eg. 123 Main Street"
        }
        disabled={isDisabled}
        fullWidth
        size="small"
        required
        onChange={onChange("street_addr")}
      />

      {/* City / Postal Code */}
      <Stack direction="row" spacing={2}>
        <TextField
          label="City"
          value={form.city ?? ""}
          error={!!errors.city}
          helperText={
            isDisabled
              ? ""
              : errors.city || "eg. Surrey"
          }
          disabled={isDisabled}
          fullWidth
          size="small"
          required
          onChange={onChange("city")}
        />
        <TextField
          label="Postal Code"
          value={form.postal_code ?? ""}
          error={!!errors.postal_code}
          helperText={
            isDisabled
              ? ""
              : errors.postal_code || "eg. A1A 1A1"
          }
          disabled={isDisabled}
          fullWidth
          size="small"
          required
          onChange={onChange("postal_code")}
        />
      </Stack>

      <Stack direction="row" spacing={2}>
        {/* Province — not in DB, kept as UI-only field with empty default */}
        <FormControl
          disabled={isDisabled}
          fullWidth
          size="small"
          error={!!errors.province}
        >
          <InputLabel id="province-label">Province</InputLabel>
          <Select
            id="province"
            labelId="province-label"
            value={form.province ?? ""}
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
          value={form.phone ?? ""}
          error={!!errors.phone}
          helperText={
            isDisabled
              ? ""
              : errors.phone || "eg. 604-123-4567"
          }
          disabled={isDisabled}
          fullWidth
          size="small"
          required
          onChange={onChange("phone")}
        />
      </Stack>

      <Stack direction="row" spacing={2}>
        {/* Language — not in DB, kept as UI-only field */}
        <Autocomplete
          options={LANGUAGES}
          value={form.language ?? ""}
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
          error={!!errors.status_in_canada}
        >
          <InputLabel id="status-in-canada-label">Status in Canada</InputLabel>
          <Select
            id="status-in-canada"
            labelId="status-in-canada-label"
            value={form.status_in_canada ?? ""}
            label="Status in Canada"
            onChange={onChange("status_in_canada")}
          >
            {status_options.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.status_in_canada || ""}</FormHelperText>
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
            value={form.tiny_bundles_program === true ? "yes" : "no"}
            onChange={(e) =>
              onChange("tiny_bundles_program")({
                target: { value: e.target.value === "yes" },
              })
            }
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