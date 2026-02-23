import React, {useState} from "react";
// import AdminCalendar from "./AdminCalendar";
import "./AdminCalendar.css";
import {
  Typography,
  Box,
  Button,
  Paper,
  Stack,
  Chip,
  Divider,
} from "@mui/material";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// generate time slots from 9am – 5pm (30 min slots for now)
const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
        slots.push(`${hour}:00`);
        slots.push(`${hour}:15`);
    }
    return slots;
};

const generateInitBlockedSlots = () => {
    const blockedSlots = [];
    days.forEach((day) => {
        for (let hour = 0; hour < 9; hour++) {
            blockedSlots.push([day,`${hour}:00`]);
            blockedSlots.push([day,`${hour}:15`]);
        }
        for (let hour = 15; hour < 24; hour++) {
            blockedSlots.push([day,`${hour}:00`]);
            blockedSlots.push([day,`${hour}:15`]);
        }
    })
    return blockedSlots;
};

const timeSlots = generateTimeSlots();

function AdminCalendarPanel() {
    const [savedBlockedSlots, setsavedBlockedSlots] = useState(generateInitBlockedSlots);
    const [blockedSlots, setBlockedSlots] = useState(savedBlockedSlots);
    const addBlockedSlot = (slot) => {
        setBlockedSlots((prevSlots) => [...prevSlots, slot]);
    }

    const removeBlockedSlot = (slot) => {
        setBlockedSlots((prevSlots) => prevSlots.filter(s => s[0] !== slot[0] || s[1] !== slot[1]));
    }


    const [editing, setEditing] = useState(false);
    const [isBlocking, setIsBlocking] = useState(false);
    const [isUnblocking, setIsUnblocking] = useState(false);

    const handleSave = () => {
        setsavedBlockedSlots(blockedSlots);
        setEditing(false);
        clearMouseTrackers();
    };
    const handleCancel = () => {
        setBlockedSlots(savedBlockedSlots);
        setEditing(false);
        clearMouseTrackers();
    };

    const clearMouseTrackers = () => {
        setIsBlocking(false);
        setIsUnblocking(false);
    }

    const handleEditMode = () => {
        setEditing(true);
    };

    const isBlocked = (day,time) => {
        if(editing) {
            return blockedSlots.some(arr =>
                arr.every((val, index) => val === [day,time][index])
            );
        }
        return savedBlockedSlots.some(arr =>
            arr.every((val, index) => val === [day,time][index])
        );
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const [weekStart, setWeekStart] = useState(startOfWeek);

    const goToNextWeek = () => { const next = new Date(weekStart);
        next.setDate(next.getDate() + 7);
        setWeekStart(next);
    };

    const goToPrevWeek = () => {
        const prev = new Date(weekStart); prev.setDate(prev.getDate() - 7);
        setWeekStart(prev);
    };

    // const goToToday = () => { setWeekStart(startOfWeek); };
    // const isCurrentWeek = weekStart.toDateString() === startOfWeek.toDateString();

  return (
    <Paper sx={{ padding: { xs: 2, md: 3 }, borderRadius: 2 }} elevation={1}>
      {/* Week header row to show current date */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={goToPrevWeek}
          size="small"
        >
          Previous 7 Days
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Mon Feb 23 - Sun Mar 1
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Vancouver - America (GMT -08:00)
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={goToNextWeek}
          size="small"
        >
          Next 7 Days
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Calendar placeholder + legend */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "0.75fr", md: "1fr 130px" },
          gap: 2,
          alignItems: "start",
        }}
      >
        {/* Calendar Placeholder */}
        <Box
          sx={{
            height: { xs: 420, md: 560 },
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: 2,
            bgcolor: "common.white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
                <div className="calendar-area">
                    <div className="calendar-header-wrapper">

                        {/*{!isCurrentWeek && (*/}
                        {/*    <button className="today-button" onClick={goToToday}>*/}
                        {/*        Today*/}
                        {/*    </button>*/}
                        {/*)}*/}

                        <div className="calendar-header">
                            <div className="time-column"></div>
                            {days.map((day, index) => {
                                const date = new Date(weekStart);
                                date.setDate(weekStart.getDate() + index);

                                const formatted = date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                });

                                return (
                                    <div key={day} className="day-header">
                                        {day}, {formatted}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="calendar">
                        {timeSlots.map((time) => (
                            <div key={time} className="calendar-row">
                                <div className="admin-time-label">{time}</div>
                                {days.map((day) => {
                                    const isAvailable = Math.random() > 0.4; // random availability
                                    if(editing) {
                                        return (
                                            <div
                                                key={day + time}
                                                className={`slot ${isBlocked(day,time)? "unavailable-vis" : isAvailable? "available": "booked"}`}
                                                onMouseDown={() => {
                                                    if (!isBlocked(day,time)) setIsBlocking(true)
                                                    else setIsUnblocking(true)
                                                }
                                                }
                                                onMouseUp={() => {
                                                    clearMouseTrackers()
                                                }
                                                }
                                                onMouseOver={() => {
                                                    if (isBlocking && !isBlocked(day,time)) addBlockedSlot([day,time])
                                                    if (isUnblocking && isBlocked(day,time)) removeBlockedSlot([day,time])
                                                }
                                                }
                                                onClick={() =>
                                                    !isBlocked(day,time)? addBlockedSlot([day,time]) : removeBlockedSlot([day,time])
                                                }
                                            ></div>
                                        );
                                    } else {
                                        return (
                                            <div
                                                key={day + time}
                                                className={`slot ${isBlocked(day,time)? "unavailable-invis" : isAvailable? "available": "booked"}`}
                                            >
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        ))}
                    </div>
                </div>
        </Box>

        {/* Legend */}
        <Stack direction = "column" spacing={1.5}>
          <LegendChip label="Available" sx={{ bgcolor: "grey.300" }} />
          <LegendChip label="Booked" sx={{ bgcolor: "secondary.main" }} />
          <LegendChip
            label="Staff Booked"
            sx={{ bgcolor: "primary.main", color: "common.white" }}
          />
          <LegendChip
            label="Blocked"
            sx={{ bgcolor: "warning.main", color: "common.white" }}
          />
        </Stack>
      </Box>

      {/* Edit slots should take you to edit slot window using the function we pass on here*/}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          {editing ? (
              <>
                  <Button variant="contained" color="greyDark" onClick={handleCancel} sx={{ fontWeight: "bold", color: "common.white"}}>
                      Discard Changes
                  </Button>
                  <Button variant="contained" color="secondary" onClick={handleSave} sx={{ fontWeight: "bold", color: "common.white"}}>
                      Confirm Changes
                  </Button>
              </>


          ) : (
              <Button variant="contained" color="secondary" onClick={handleEditMode} sx={{ fontWeight: "bold", color: "common.white"}}>
                  Edit Available Slots
              </Button>
          )}

      </Box>
    </Paper>
  );
}

function LegendChip({ label, sx }) {
  return (
    <Chip
      label={label}
      sx={{
        justifyContent: "flex-start",
        borderRadius: 2,
        fontWeight: 600,
        px: 0.5,
        ...sx,
      }}
    />
  );
}

export default AdminCalendarPanel;
