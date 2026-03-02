import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Check as CheckIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";

const STATUS_OPTIONS = [
  "Canadian Citizen",
  "Permanent Resident",
  "Refugee/Protected Person",
  "Temporary Resident (6 months+)",
];

export default function RegistrationFormInfo({ appointment, onSave }) {
  // Helper function for setting appointment form fields
  const buildFormFromAppointment = (appt) => ({
    email: appt?.email ?? "",
    name: appt?.name ?? "",
    phone: appt?.phone ?? "",
    address: appt?.address ?? "",
    statusInCanada: appt?.statusInCanada ?? "Temporary Resident (6 months+)",
    applyingToTinyBundles: appt?.applyingToTinyBundles ?? "no",
    householdMembers: appt?.householdMembers ?? "",
    day: appt?.day ?? "",
    startTime: appt?.startTime ?? "",
    duration: appt?.duration ?? 0,
    dateLabel: appt?.dateLabel ?? "",
    timeLabel: appt?.timeLabel ?? "",
  });

  const [isDisabled, setIsDisabled] = useState(true);
  const [form, setForm] = useState(buildFormFromAppointment(appointment));

  // Validator helper functions
  const isValidPhone = (value) => value.replace(/\D/g, "").length >= 10;
  const phoneInvalid = form.phone !== "" && !isValidPhone(form.phone);
  const householdSizeInvalid =
    form.householdMembers !== "" && Number(form.householdMembers) < 1;
  const isNameValid = (name) => {
    if (!name.trim()) return false;
    // Name can only contain letters, spaces, hyphens, apostrophes
    const validPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
    return validPattern.test(name);
  };
  const isNameInvalid = !isNameValid(form.name);
  const isAddressInvalid = !form.address.trim();

  // Update form when appointment prop changes
  useEffect(() => {
    if (appointment) {
      setForm(buildFormFromAppointment(appointment));
    }
  }, [appointment]);

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasErrors =
      isNameInvalid || isAddressInvalid || phoneInvalid || householdSizeInvalid;

    if (hasErrors) return;
    if (onSave) {
      onSave(form);
    } else {
      console.log("Save changes", form);
    }
    setIsDisabled(true);
  };

  const handleCancel = () => {
    setForm(buildFormFromAppointment(appointment));
    setIsDisabled(true);
  };

  return (
    <Box>
      <Stack spacing={2} component="form" noValidate onSubmit={handleSubmit}>
        <Divider />
        {/* Buttons for editing the form, saving changes, and discarding changes */}
        {isDisabled ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<EditIcon />}
            onClick={() => setIsDisabled(false)}
            sx={{ fontWeight: 800, color: "common.white" }}
          >
            Edit
          </Button>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<ClearIcon />}
              onClick={handleCancel}
              sx={{ fontWeight: 800, flex: 1 }}
            >
              Discard Changes
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CheckIcon />}
              sx={{ fontWeight: 800, color: "common.white", flex: 1 }}
            >
              Save Changes
            </Button>
          </Stack>
        )}
        <Divider />
        {/* Start of form fields */}
        <TextField
          label="Full Name"
          value={form.name}
          onChange={onChange("name")}
          fullWidth
          required
          disabled={isDisabled}
          error={isNameInvalid}
          helperText={
            isNameInvalid
              ? "Please enter a valid name using letters, spaces, hyphens, or apostrophes."
              : ""
          }
        />

        <TextField
          label="Phone Number"
          type="tel"
          value={form.phone}
          onChange={onChange("phone")}
          fullWidth
          placeholder="(123) 456-7890"
          error={phoneInvalid}
          helperText={
            phoneInvalid
              ? "Please enter a valid phone number (at least 10 digits)"
              : ""
          }
          required
          disabled={isDisabled}
        />

        <TextField
          label="Address"
          value={form.address}
          onChange={onChange("address")}
          fullWidth
          required
          error={isAddressInvalid}
          helperText={isAddressInvalid ? "Please enter an address" : ""}
          disabled={isDisabled}
        />

        <TextField
          select
          label="Status in Canada"
          value={form.statusInCanada}
          onChange={onChange("statusInCanada")}
          fullWidth
          required
          disabled={isDisabled}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: isDisabled ? "text.disabled" : "text.primary",
          }}
        >
          <Typography sx={{ fontWeight: 500 }}>
            Applying to the Tiny Bundles Program?
          </Typography>
          <Tooltip
            title="Please select Yes if your household has a pregnant mom or children under 12 months old.
                  Tiny Bundles families receive food every week instead of every two weeks. They are also
                  supplied with fresh eggs and milk while pregnant or nursing. Additional fresh vegetables
                  and other nutritional items are supplied when available."
          >
            <Link
              href="https://surreyfoodbank.org/program/babies-toddlers/"
              target="_blank"
              rel="noopener noreferrer"
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
        </Box>
        <RadioGroup
          row
          value={form.applyingToTinyBundles}
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

        <TextField
          label="Household size (including yourself)"
          type="number"
          value={form.householdMembers}
          onChange={onChange("householdMembers")}
          fullWidth
          inputProps={{ min: "1", step: "1" }}
          error={householdSizeInvalid}
          helperText={
            householdSizeInvalid ? "Household size must be 1 or more" : ""
          }
          required
          disabled={isDisabled}
        />
      </Stack>
    </Box>
  );
}
// GitHub Copilot was used to debug the code above and help with localStorage logic
