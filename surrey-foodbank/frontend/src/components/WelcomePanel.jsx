import React, {useEffect, useState} from "react";
import { Typography, Box, Button } from "@mui/material";


function WelcomePanel({ onEditSlots, onCancel, onSave, onBook, isConfirmed, setIsConfirmed }) {

    const [editing, setEditing] = useState(false);

    const handleEdit = () => {
        setEditing(true);
        setIsConfirmed(false);
        onEditSlots();
    }

    const handleDiscard = () => {
        onCancel();
        setEditing(false);
    }

    const handleSave = () => {
        onSave();
    }
    const handleBook = () => {
        onBook();
    }

    useEffect(() => {
        if(isConfirmed) {
            setEditing(false);
        }
    }, [isConfirmed]);

    return (
        <Box sx={{ pt: { xs: 0, md: 6 } }}>
            <Typography variant="h3" align="center" color="primary" sx={{ fontSize: 25, mb: 10, fontWeight: "bold" }}>
                Welcome!
            </Typography>
            {editing ? (
                <Typography variant="body1" align="center" sx={{ mb: 9.5, fontSize: 18 }}>
                    Click and drag across slots to block or unblock availability.
                </Typography>
            ) : (
                <div>
                    <Typography variant="body1" align="center"  sx={{ mb: 1.5, fontSize: 18 }}>
                        Click on booked appointments to see details.
                    </Typography>
                    <Typography variant="body1" align="center"  sx={{ fontSize: 18 }}>
                        Click on available slot to book appointment.
                    </Typography>
                </div>
            )}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
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
