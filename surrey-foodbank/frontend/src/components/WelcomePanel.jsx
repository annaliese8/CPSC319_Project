import React, { useState } from "react";
import { Typography, Box, Button } from "@mui/material";
import AppointmentInfoDialog from "./AppointmentInfoDialog.jsx";


function WelcomePanel({ onEditSlots, onCancel, onSave, onBook }) {

    const [editing, setEditing] = useState(false);

    const handleEdit = () => {
        setEditing(true);
        onEditSlots();
    }

    const handleDiscard = () => {
        onCancel();
        setEditing(false);
    }

    const handleSave = () => {
        onSave();
        setEditing(false);
    }
    const handleBook = () => {
        onBook();
    }

    return (
        <Box sx={{ pt: { xs: 0, md: 6 } }}>
            <Typography variant="h3" align="center" color="primary" sx={{ fontSize: 25, mb: 2, fontWeight: "bold" }}>
                Welcome!
            </Typography>
            <Typography variant="body1" sx={{ mb: 1.5, fontStyle: "italic" }}>
                Click on booked appointments to see details and edit.
            </Typography>
            <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                Click on grey availability slots to book appointment.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                {editing ? (
                    <div className="button-container">
                        <Button variant="contained" color="secondary" onClick={handleSave}
                            sx={{ fontWeight: "bold", color: "common.white" }}>
                            Confirm Changes
                        </Button>
                        <Button variant="contained" color="greyDark" onClick={handleDiscard}
                            sx={{ fontWeight: "bold", color: "common.white" }}>
                            Discard Changes
                        </Button>
                    </div>

                ) : (
                    <div className="button-container">
                        <Button variant="contained" color="primary" onClick={handleBook}
                            sx={{ fontWeight: "bold", color: "common.white" }}>
                            Book Appointment
                        </Button>
                        <Button variant="contained" color="warning" onClick={handleEdit}
                            sx={{ fontWeight: "bold", color: "common.white" }}>
                            Edit Available Slots
                        </Button>
                    </div>
                )}
            </Box>
        </Box>
    );
}

export default WelcomePanel;
