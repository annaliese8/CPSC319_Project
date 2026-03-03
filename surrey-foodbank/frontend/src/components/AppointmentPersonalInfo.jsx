import React from "react";
import {
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Stack,
  FormControlLabel,
  RadioGroup,
  Radio,
  IconButton,
  Tooltip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const STATUS_OPTIONS = [
  "Temporary Resident (6 months+)",
  "Permanent Resident",
  "Canadian Citizen",
  "Refugee/Protected Person"
];

export default function AppointmentPersonalInfo({ appointment }) {
  // Frontend-only form state (you’ll hook backend later)
  const [form, setForm] = React.useState({
    name: appointment?.name ?? "",
    phone: appointment?.phone ?? "",
    address: appointment?.address ?? "",
    statusInCanada: appointment?.statusInCanada ?? "Temporary Resident (6 months+)",   
    applyingToTinyBundles: appointment?.applyingToTinyBundles ?? "no",
    householdMembers: appointment?.householdMembers ?? "",
    dateLabel: appointment?.dateLabel ?? "",
    timeLabel: appointment?.timeLabel ?? "",
  });

  // Update form when appointment prop changes
  React.useEffect(() => {
    if (appointment) {
      setForm({
        name: appointment.name ?? "",
        phone: appointment.phone ?? "",
        address: appointment.address ?? "",
        statusInCanada: appointment.statusInCanada ?? "Temporary Resident (6 months+)",
        applyingToTinyBundles: appointment.applyingToTinyBundles ?? "no",
        householdMembers: appointment.householdMembers ?? "",
        dateLabel: appointment.dateLabel ?? "",
        timeLabel: appointment.timeLabel ?? "",
      });
    }
  }, [appointment]);

  const onChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const isValidPhone = (value) => value.replace(/\D/g, "").length >= 10;
  const phoneInvalid = form.phone !== "" && !isValidPhone(form.phone);
  const householdSizeInvalid =
    form.householdMembers !== "" && Number(form.householdMembers) < 1;

  const handleSave = () => {
    if (!form.phone.trim() || !isValidPhone(form.phone)) {
      return;
    }

    if (onSave) {
      onSave(form);
    } else {
      console.log("Save changes", form);
    }
  };

  return (
    <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}>
                Personal Info
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="Name*"
                  value={form.name}
                  onChange={onChange("name")}
                  fullWidth
                />

                <TextField
                  label="Phone Number*"
                  type="tel"
                  value={form.phone}
                  onChange={onChange("phone")}
                  fullWidth
                  placeholder="(123) 456-7890"
                  error={phoneInvalid}
                  helperText={phoneInvalid ? "Please enter a valid phone number (at least 10 digits)" : ""}
                />

                <TextField
                  label="Address*"
                  value={form.address}
                  onChange={onChange("address")}
                  fullWidth
                />

                <TextField
                  select
                  label="Status in Canada*"
                  value={form.statusInCanada}
                  onChange={onChange("statusInCanada")}
                  fullWidth
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 500 }}>
                    Applying to the Tiny Bundles Program?
                  </Typography>
                  <Tooltip title="Information about the Tiny Bundles Program">
                    <a href = "https://surreyfoodbank.org/program/babies-toddlers/" target="_blank" rel="noopener noreferrer">
                    <InfoIcon sx={{ fontSize: 20, color: "primary.main", cursor: "pointer" }} />
                    </a>
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
                  />
                  <FormControlLabel
                    value="no"
                    control={<Radio />}
                    label="No"
                  />
                </RadioGroup>

                <TextField
                  label="Please enter a valid household size including you (1 or more)"
                  type="number"
                  value={form.householdMembers}
                  onChange={onChange("householdMembers")}
                  fullWidth
                  inputProps = {{ min: "1", step: "1" }}
                  error={householdSizeInvalid}
                  helperText={householdSizeInvalid ? "Household size must be 1 or more" : ""}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSave}
                    sx={{ fontWeight: 800, color: "common.white" }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Stack>
     </Box>
  );
}
// GitHub Copilot was used to debug the code above and help with localStorage logic