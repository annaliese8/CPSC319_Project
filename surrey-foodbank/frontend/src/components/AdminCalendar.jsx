import {Box, Button, Divider, Paper, Stack, Typography} from "@mui/material";
import React, { useState } from "react";
import "./AdminCalendar.css";

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



function AdminCalendar() {
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

    const goToToday = () => { setWeekStart(startOfWeek); };

    const isCurrentWeek = weekStart.toDateString() === startOfWeek.toDateString();

    return (
        <div className="booking-container">
            <div className="calendar-area">

                {/* Week Navigation */}
                {/* <div className="week-controls"
           style={{ display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center" }}>
        <button onClick={goToPrevWeek}>Previous Week</button>
        {!isCurrentWeek && <button onClick={goToToday}>Today</button>}
        <button onClick={goToNextWeek}>Next Week</button>
      </div> */}

                <div className="calendar-header-wrapper">
                    <button className="week-nav-button week-prev" onClick={goToPrevWeek}>
                        ← Previous
                    </button>

                    {!isCurrentWeek && (
                        <button className="today-button" onClick={goToToday}>
                            Today
                        </button>
                    )}

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
                                    {day} {formatted}
                                </div>
                            );
                        })}
                    </div>

                    <button className="week-nav-button week-next" onClick={goToNextWeek}>
                        Next →
                    </button>
                </div>

                {/* Calendar */}
                <div className="calendar">
                    {timeSlots.map((time) => (
                        <div key={time} className="calendar-row">
                            <div className="time-label">{time}</div>
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

            {/* Booking Panel */}
            <div className="side-panel">
                <h3>Appointment Listing</h3>
                {editing ? (
                    <>
                        <button onClick={handleSave}>Confirm Changes</button>
                        <button className="cancel-button" onClick={handleCancel}>Cancel Changes</button>
                    </>


                ) : (
                    <button onClick={handleEditMode}>Edit Slots</button>
                )}
            </div>
        </div>
    );
}

export default AdminCalendar;