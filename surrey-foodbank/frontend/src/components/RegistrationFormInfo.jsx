import { Box, Button, Divider, Paper, Stack } from "@mui/material";
import {
  Check as CheckIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import RegistrationFields from "./RegistrationFields";
import { validateRegistrationForm } from "../utils/ValidateRegistrationForm";

export default function RegistrationFormInfo({ appointment, onSave }) {
  // Helper function for setting appointment form fields
  // CHANGED: updated all field names to match Supabase DB column names
  const buildFormFromAppointment = (appt) => ({
    email: appt?.email_address ?? appt?.email ?? "",
    first_name: appt?.first_name ?? "",
    last_name: appt?.last_name ?? "",
    phone: appt?.phone ?? "",
    street_addr: appt?.street_addr ?? "",
    city: appt?.city ?? "",
    postal_code: appt?.postal_code ?? "",
    status_in_canada: appt?.status_in_canada ?? "Temporary Resident (6 months+)",
    tiny_bundles_program: appt?.tiny_bundles_program ?? false,
    householdMembers: appt?.householdMembers ?? [],
    day: appt?.day ?? "",
    startTime: appt?.startTime ?? "",
    duration: appt?.duration ?? 0,
    dateLabel: appt?.dateLabel ?? "",
    timeLabel: appt?.timeLabel ?? "",
  });

  const [isDisabled, setIsDisabled] = useState(true);
  const [form, setForm] = useState(buildFormFromAppointment(appointment));
  const [formErrors, setFormErrors] = useState({});

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
    const errors = validateRegistrationForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    if (onSave) {
      onSave(form);
    } else {
      console.log("Save changes", form);
    }
    setIsDisabled(true);
  };

  const handleCancel = () => {
    setForm(buildFormFromAppointment(appointment));
    setFormErrors({});
    setIsDisabled(true);
  };

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          borderRadius: 2,
          bgcolor: "grey.25",
        }}
      >
        <Stack spacing={2} component="form" noValidate onSubmit={handleSubmit}>
          {/* Buttons for editing the form, saving changes, and discarding changes */}
          {isDisabled ? (
            <Button
              label="Edit registration form"
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
          <RegistrationFields
            form={form}
            onChange={onChange}
            errors={formErrors}
            isDisabled={isDisabled}
          />
        </Stack>
      </Paper>
    </Box>
  );
}

// GitHub Copilot was used to debug the code above and help with localStorage logic