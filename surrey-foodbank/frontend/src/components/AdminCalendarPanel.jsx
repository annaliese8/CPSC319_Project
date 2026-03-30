import React, {useState} from "react";
import "./AdminCalendar.css";
import {Typography, Box, Button, Paper, Stack, Divider} from "@mui/material";
import AdminCalendar from "./AdminCalendar.jsx";

function AdminCalendarPanel({
                                isEditing,
                                saveChanges,
                                discardChanges,
                                toggleBookingPanel,
                                changeBookingAppointment, // appointment to rebook (from ApplicantInfoPage)
                                appointments = [],
                                isNewBooking,
                            }) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const [weekStart, setWeekStart] = useState(startOfWeek);

    const formatDateShort = (date) => {
        return date.toLocaleDateString("en-US", {month: "short", day: "numeric"});
    };

    const goToNextWeek = () => {
        const next = new Date(weekStart);
        next.setDate(next.getDate() + 7);
        setWeekStart(next);
    };

    const goToPrevWeek = () => {
        const prev = new Date(weekStart);
        prev.setDate(prev.getDate() - 7);
        setWeekStart(prev);
    };

    const getWeekEnd = (start) => {
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return end;
    };

    const goToToday = () => {
        setWeekStart(startOfWeek);
    };
    const isCurrentWeek = weekStart.toDateString() === startOfWeek.toDateString();

    return (
        <Paper sx={{padding: {xs: 2, md: 3}, borderRadius: 2}} elevation={1}>
            {/* Week header row to show current date */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Button variant="outlined" onClick={goToPrevWeek} size="small">
                    Previous 7 Days
                </Button>

                <Box sx={{textAlign: "center"}}>
                    <Typography variant="h5" sx={{fontWeight: 700}}>
                        Sun {formatDateShort(weekStart)} - Sat{" "}
                        {formatDateShort(getWeekEnd(weekStart))}
                    </Typography>
                    {!isCurrentWeek && (
                        <Button sx={{width: 10, marginRight: 1, fontSize:12}} variant="contained" onClick={goToToday} size="small">
                            Today
                        </Button>
                    )}
                    <Typography variant="caption" color="text.secondary">
                        Vancouver - America (GMT -08:00)
                    </Typography>

                </Box>

                <Button variant="outlined" onClick={goToNextWeek} size="small">
                    Next 7 Days
                </Button>
            </Box>

            <Divider sx={{my: 1}}/>

            {/* Legend */}
            <Stack direction="row" spacing={1.5} sx={{mb: 1, justifyContent: "center"}}>
                <LegendChip label="Available" sx={{bgcolor: "secondary.main"}}/>
                <LegendChip
                    label="Booked"
                    sx={{bgcolor: "primary.main", color: "common.white"}}
                />
                {isEditing ? (
                    <LegendChip
                        label="Blocked"
                        sx={{bgcolor: "warning.main", color: "common.white"}}
                    />
                ) : ""}
            </Stack>

            {/* Calendar */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {xs: "0.75fr", md: "1fr 130px"},
                    alignContent: "center",
                    alignItems: "center",
                }}
            >
                <AdminCalendar
                    isEditing={isEditing}
                    saveChanges={saveChanges}
                    discardChanges={discardChanges}
                    weekStart={weekStart}
                    isBookingPanel={toggleBookingPanel}
                    changeBookingAppointment={changeBookingAppointment}
                    appointments={appointments}
                    isNewBooking={isNewBooking}
                />
            </Box>
        </Paper>
    );
}

function LegendChip({label, sx}) {
    return (
        <Stack direction="row" spacing={1} alignItems="center" sx={{p: 0.5}}>
            <Box sx={{width: 20, height: 20, borderRadius: 0.5, ...sx}}/>
            <Typography variant="body2" sx={{fontWeight: 600}}>
                {label}
            </Typography>
        </Stack>
    );
}

export default AdminCalendarPanel;
