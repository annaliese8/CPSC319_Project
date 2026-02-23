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
    address: appointment?.address ?? "",
    statusInCanada: appointment?.statusInCanada ?? "Temporary Resident (6 months+)",   
     applyingToTinyBundles: appointment?.applyingToTinyBundles ?? "no",
    householdMembers: appointment?.householdMembers ?? "",  });

  const onChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSave = () => {
    console.log("Save changes", form);
    // Later: call API 
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
                  label="Number of additional household members*"
                  type="number"
                  value={form.householdMembers}
                  onChange={onChange("householdMembers")}
                  fullWidth
                  inputProps={{ min: "0" }}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={onSave}
                    sx={{ fontWeight: 800, color: "common.white" }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Stack>
            </Box>
  );
}
// GitHub Copilot was used to debug the code above 