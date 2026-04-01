import { useState, useEffect } from "react";
import {
    Box,
    Chip,
    Menu,
    MenuItem,
    Stack,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export const STATUS_OPTIONS = [
    { label: "Booked", color: "info" },
    { label: "Checked In", color: "primary" },
    { label: "Complete", color: "success" },
    { label: "No Show", color: "error" },
];

/**  A reusable status selector created for staff use.
 *  Displays the current appointment status as a Chip, and opens a dropdown
 *  menu allowing staff to update the status. to the options above in STATUS_OPTIONS
 *  
 *  This component does NOT own the appointment data. It simply displays
 * the current status and notifies the parent when a new status is chosen.
 */

export default function AppointmentStatus({ appointment, onStatusChange }) {
    const [status, setStatus] = useState("");

    // Anchor element for the dropdown menu
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);


    // Sync local status state whenever the appointment prop changes.
    useEffect(() => {
     const status = appointment?.appointmentStatus || appointment?.appointment_status
     if (status) {
      setStatus(status)
     }
    }, [appointment])

    // Opens the dropdown menu
    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    /**
     * Handles selecting a new status.
     * - Updates parent via onStatusChange callback
     * - Updates local UI state for immediate visual feedback
     */
    const handleSelect = (value) => {
        onStatusChange?.(value);
        setStatus(value);
        setAnchorEl(null);
    };

    // Normalize DB status strings (e.g. "booked" → "Booked") before lookup
    const normalizeLabel = (s) => {
        if (!s) return s;
        const map = {
            "booked": "Booked",
            "checked in": "Checked In",
            "checked-in": "Checked In",
            "complete": "Complete",
            "no show": "No Show",
        };
        return map[s.toLowerCase()] ?? s;
    };

    // Find the color associated with the current status
    const selectedOption = STATUS_OPTIONS.find(
        (option) => option.label === normalizeLabel(status)
    );

    return (
        <Box sx={{ maxWidth: 160, mx: "auto", pt: 2 }}>
            {/* <Typography>Appointment Status</ Typography> */}
            <Chip
                label={
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <span>{normalizeLabel(status) || "Select status"}</span>
                        <ArrowDropDownIcon fontSize="small" />
                    </Stack>
                }
                onClick={handleOpen}
                color={selectedOption?.color || "default"}
                variant={status ? "filled" : "outlined"}
                sx={{
                    minWidth: 140,
                    px: 1.5,
                    py: 0.5,
                    fontWeight: 700,
                    borderRadius: "16px",
                    "&:hover": {
                        opacity: 0.9,
                    },
                }}
            />

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    elevation: 3,
                    sx: { borderRadius: 2, minWidth: 160, py: 1 },
                }}
            >
                {STATUS_OPTIONS.map((option) => (
                    <MenuItem
                        key={option.label}
                        onClick={() => handleSelect(option.label)}
                        sx={{
                            py: 1,
                            "&:hover": {
                                bgcolor: `${option.color}.light`,
                            },
                        }}
                    >
                        <Chip
                            label={option.label}
                            color={option.color}
                            size="small"
                            sx={{ fontWeight: 700 }}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}

// AI tools were used to help create this component