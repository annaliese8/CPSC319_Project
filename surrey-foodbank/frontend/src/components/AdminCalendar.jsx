import React, { useState } from "react";
import "./AdminCalendar.css";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// generate time slots from startHour to endHour
const generateTimeSlots = (startHour, endHour) => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
        slots.push(`${hour}:00`);
        slots.push(`${hour}:15`);
        slots.push(`${hour}:30`);
        slots.push(`${hour}:45`);
    }
    return slots;
};

const generateDayTimeSlots = () => {
    const tDSlots = [];
    days.forEach((day) => {
        for (let hour = 0; hour < 24; hour++) {
            tDSlots.push([day, `${hour}:00`]);
            tDSlots.push([day, `${hour}:15`]);
            tDSlots.push([day, `${hour}:30`]);
            tDSlots.push([day, `${hour}:45`]);
        }
    })
    return tDSlots;
};

// pre-sets booking availability to 9-3
const generateInitBlockedSlots = () => {
    const blockedSlots = [];
    days.forEach((day) => {
        for (let hour = 0; hour < 9; hour++) {
            blockedSlots.push([day, `${hour}:00`]);
            blockedSlots.push([day, `${hour}:15`]);
            blockedSlots.push([day, `${hour}:30`]);
            blockedSlots.push([day, `${hour}:45`]);
        }
        for (let hour = 15; hour < 24; hour++) {
            blockedSlots.push([day, `${hour}:00`]);
            blockedSlots.push([day, `${hour}:15`]);
            blockedSlots.push([day, `${hour}:30`]);
            blockedSlots.push([day, `${hour}:45`]);
        }
    })
    return blockedSlots;
};

const fullTimeSlots = generateTimeSlots(0, 24);
const dayTimeSlots = generateDayTimeSlots()

function AdminCalendar({isEditing, saveChanges, discardChanges}) {
    // Load all appointments from localStorage
    React.useEffect(() => {
        const loadedAppointments = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('applicant_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.day && data.startTime) {
                        loadedAppointments.push({
                            email: key.replace('applicant_', ''),
                            ...data
                        });
                    }
                } catch (e) {
                    console.error('Error loading appointment:', e);
                }
            }
        }
        setAppointments(loadedAppointments);
    }, []);

    React.useEffect(() => {
        // Get demo user's appointment data (harnoor@example.com from InitDemoData)
        const demoEmail = localStorage.getItem("activeUser") ? JSON.parse(localStorage.getItem("activeUser")).email : "harnoor@exmaple.com";
        const storedData = localStorage.getItem(`applicant_${demoEmail}`);

        if (storedData) {
            setAppointmentData(JSON.parse(storedData));
        } else {
            // Fallback to sample data if no stored data exists
            setAppointmentData({
                name: "Joshua Pemberton",
                address: "123 Main Street, Surrey BC V3T 1A2",
                statusInCanada: "Permanent Resident",
                applyingToTinyBundles: "yes",
                householdMembers: "2",
                dateLabel: "Monday March 26, 2026",
                timeLabel: "3:30pm – 3:45pm",
            });
        }
    }, []);

    // React.useEffect(() => {
    //     if(saveChanges) {
    //         console.log("AAAAAAAA");
    //     }
    // });

    const [appointmentData, setAppointmentData] = React.useState(null);
    const [appointments, setAppointments] = React.useState([]);
    const [selectedSlot, setSelectedSlot] = React.useState(null);
    const [showBookingPanel, setShowBookingPanel] = React.useState(false);
    const [savedBlockedSlots, setsavedBlockedSlots] = useState(generateInitBlockedSlots);
    const [blockedSlots, setBlockedSlots] = useState(savedBlockedSlots);
    const [editing, setEditing] = useState(true);
    const [isBlocking, setIsBlocking] = useState(false);
    const [isUnblocking, setIsUnblocking] = useState(false);


    const addBlockedSlot = (slot) => {
        setBlockedSlots((prevSlots) => [...prevSlots, slot]);
    }

    const getAvailableSlots = () => {
        return dayTimeSlots.filter(
            item => !savedBlockedSlots.some(slot => slot.every((val, index) => val === item[index]))
        )
    }

    const getEarliestAvailHour = () => {
        let timeMin = 1000;
        getAvailableSlots().forEach((slot) => {
            const intTime = parseInt(slot[1].slice(0, slot[1].indexOf(":")));
            if(intTime < timeMin) {timeMin = intTime}
        })
        return(timeMin);
    }

    const getLatestAvailHour = () => {
        let timeMax = 0;
        getAvailableSlots().forEach((slot) => {
            const intTime = parseInt(slot[1].slice(0, slot[1].indexOf(":")));
            if(intTime > timeMax) {timeMax = intTime}
        })
        return (timeMax++);
    }

    const visibleTimeSlots = generateTimeSlots(getEarliestAvailHour(), getLatestAvailHour());

    const removeBlockedSlot = (slot) => {
        setBlockedSlots((prevSlots) => prevSlots.filter(s => s[0] !== slot[0] || s[1] !== slot[1]));
    }

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

    const isBlocked = (day, time) => {
        if (editing) {
            return blockedSlots.some(arr =>
                arr.every((val, index) => val === [day, time][index])
            );
        }
        return savedBlockedSlots.some(arr =>
            arr.every((val, index) => val === [day, time][index])
        );
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const [weekStart, setWeekStart] = useState(startOfWeek);

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

    const [openInfoDialog, setOpenInfoDialog] = React.useState(false);

    // Handle clicking on an available slot to book
    const handleSlotClick = (day, time) => {
        if (!editing && !isBlocked(day, time) && !isSlotBooked(day, time)) {
            setSelectedSlot({day, time, weekStart});
            setShowBookingPanel(true);
        } else if (!editing && isSlotBooked(day, time)) {
            // Show appointment info if slot is booked
            const appointment = appointments.find(apt => apt.day === day && apt.startTime === time);
            if (appointment) {
                setAppointmentData(appointment);
                setOpenInfoDialog(true);
            }
        }
    };

    // Check if a slot is booked
    const isSlotBooked = (day, time) => {
        return appointments.some(apt => {
            if (apt.day !== day) return false;

            // Check if this time falls within the appointment duration
            const [aptHour, aptMinute] = apt.startTime.split(':').map(Number);
            const [slotHour, slotMinute] = time.split(':').map(Number);

            const aptStartMinutes = aptHour * 60 + aptMinute;
            const slotMinutes = slotHour * 60 + slotMinute;
            const aptEndMinutes = aptStartMinutes + apt.duration;

            return slotMinutes >= aptStartMinutes && slotMinutes < aptEndMinutes;
        });
    };

    // Handle confirming a booking
    const handleConfirmBooking = (appointmentData) => {
        // Save to localStorage
        const key = `applicant_${appointmentData.email}`;
        localStorage.setItem(key, JSON.stringify(appointmentData));

        // Update appointments list
        setAppointments(prev => [...prev, appointmentData]);

        // Close booking panel
        setShowBookingPanel(false);
        setSelectedSlot(null);
    };

    return (
            <div className="calendar-area">
            <div className="calendar-header-wrapper">
                <div className="calendar-header">
                    <div className="time-column" onClick={() => handleSave()}></div>
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
                {(editing? fullTimeSlots: visibleTimeSlots).map((time) => (
                    <div key={time} className="admin-calendar-row">
                        <div className="admin-time-label">{time}</div>
                        {days.map((day) => {
                            const slotBooked = isSlotBooked(day, time);
                            if (editing) {
                                return (
                                    <div
                                        key={day + time}
                                        className={`slot ${isBlocked(day, time) ? "unavailable-vis" : slotBooked ? "admin-booked" : "admin-available"}`}
                                        onMouseDown={() => {
                                            if (!isBlocked(day, time)) setIsBlocking(true)
                                            else setIsUnblocking(true)
                                        }
                                        }
                                        onMouseUp={() => {
                                            clearMouseTrackers()
                                        }
                                        }
                                        onMouseOver={() => {
                                            if (isBlocking && !isBlocked(day, time)) addBlockedSlot([day, time])
                                            if (isUnblocking && isBlocked(day, time)) removeBlockedSlot([day, time])
                                        }
                                        }
                                        onClick={() =>
                                            !isBlocked(day, time) ? addBlockedSlot([day, time]) : removeBlockedSlot([day, time])
                                        }
                                    ></div>
                                );
                            } else {
                                return (
                                    <div
                                        key={day + time}
                                        className={`slot ${isBlocked(day, time) ? "unavailable-invis" : slotBooked ? "admin-booked" : "admin-available"}`}
                                        onClick={() => handleSlotClick(day, time)}

                                    >
                                    </div>
                                );
                            }
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminCalendar;