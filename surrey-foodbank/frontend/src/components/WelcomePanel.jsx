import React, {useState} from "react";
import {Typography, Box, Button} from "@mui/material";
import AppointmentInfoDialog from "./ApplicantInfoCard.jsx";


function WelcomePanel({onEditSlots, onCancel, onSave}) {

    const [editing, setEditing] = useState(false);

    const handleEdit = () => {
        setEditing(true);
        onEditSlots();
    }

    const handleSave = () => {
        onSave();
        setEditing(false);
    }

    const handleDiscard= () => {
        onCancel();
        setEditing(false);
    }

    return (
        <Box sx={{pt: {xs: 0, md: 6}}}>
            <Typography variant="h3" align="center" color="primary" sx={{fontSize: 25, mb: 2, fontWeight: "bold"}}>
                Welcome!
            </Typography>
            <Typography variant="body1" sx={{mb: 1.5, fontStyle: "italic"}}>
                Click on booked appointments to see details and edit.
            </Typography>
            <Typography variant="body1" sx={{fontStyle: "italic"}}>
                Click on grey availability slots to book appointment.
            </Typography>
            <Box sx={{display: "flex", justifyContent: "flex-end", mt: 3}}>
                {editing ? (
                    <>
                        <Button variant="contained" color="greyDark" onClick={handleDiscard}
                                sx={{marginRight: "3px", fontWeight: "bold", color: "common.white"}}>
                            Discard Changes
                        </Button>
                        <Button variant="contained" color="secondary" onClick={handleSave}
                                sx={{fontWeight: "bold", color: "common.white"}}>
                            Confirm Changes
                        </Button>
                    </>

                ) : (
                    <Button variant="contained" color="secondary" onClick={handleEdit}
                            sx={{fontWeight: "bold", color: "common.white"}}>
                        Edit Available Slots
                    </Button>
                )}
            </Box>
        </Box>
    );
}

export default WelcomePanel;
