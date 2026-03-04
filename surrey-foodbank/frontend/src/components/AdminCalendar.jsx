import React, { useState } from "react";
import "./AdminCalendar.css";
import AppointmentInfoDialog from "./ApplicantInfoCard.jsx";
import StaffBookingPanel from "./StaffBookingPanel.jsx";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

function AdminCalendar({isEditing, saveChanges, discardChanges, weekStart, isBookingPanel}) {
    const [appointmentData, setAppointmentData] = React.useState(null);
    const [appointments, setAppointments] = React.useState([]);
    const [selectedSlot, setSelectedSlot] = React.useState(null);
    const [showBookingPanel, setShowBookingPanel] = React.useState(false);
    const [savedBlockedSlots, setsavedBlockedSlots] = useState(generateInitBlockedSlots);
    const [blockedSlots, setBlockedSlots] = useState(savedBlockedSlots);
    const [isBlocking, setIsBlocking] = useState(false);
    const [isUnblocking, setIsUnblocking] = useState(false);

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
        return (timeMax+1);
    }

    const isDisplayTime = (time) => {
        return time.slice(-2) === "00" || time.slice(-2) === "30";

    }

    const visibleTimeSlots = generateTimeSlots(getEarliestAvailHour(), getLatestAvailHour());

    const removeBlockedSlot = (slot) => {
        setBlockedSlots((prevSlots) => prevSlots.filter(s => s[0] !== slot[0] || s[1] !== slot[1]));
    }

    const handleSave = () => {
        setsavedBlockedSlots(blockedSlots);
        clearMouseTrackers();
    };
    const handleCancel = () => {
        setBlockedSlots(savedBlockedSlots);
        clearMouseTrackers();
    };

    const handleBookingPanel = (day, time) => {
        setSelectedSlot({day, time, weekStart});
        setShowBookingPanel(true);
    }

    const clearMouseTrackers = () => {
        setIsBlocking(false);
        setIsUnblocking(false);
    }

    const isBlocked = (day, time) => {
        if (isEditing) {
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

    const [openInfoDialog, setOpenInfoDialog] = React.useState(false);

    // Handle clicking on an available slot to book
    const handleSlotClick = (day, time) => {
        if (!isEditing && !isBlocked(day, time) && !isSlotBooked(day, time)) {
            handleBookingPanel(day,time);
        } else if (!isEditing && isSlotBooked(day, time)) {
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

    React.useEffect(() => {
        if (saveChanges) {
            handleSave();
        }
    }, [saveChanges]);

    React.useEffect(() => {
        if (discardChanges) {
            handleCancel();
        }
    }, [discardChanges]);

    React.useEffect( () => {
        if (isBookingPanel > 0) {
            handleBookingPanel(days[0],fullTimeSlots[0]);
        }
    }, [isBookingPanel])

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
                            <>
                                <div key={day} className="day-header">
                                    {day}
                                    <div key={day} className="day-header-2">
                                        {formatted}
                                    </div>
                                </div>
                            </>
                        );
                    })}
                </div>
            </div>

                {/* Calendar */}

                <div className="calendar">
                    {(isEditing ? fullTimeSlots : visibleTimeSlots).map((time) => (
                    <div key={time} className="admin-calendar-row">
                        <div className="admin-time-label">{isDisplayTime(time)? time : ""}</div>
                        {days.map((day) => {
                            const slotBooked = isSlotBooked(day, time);
                            if (isEditing) {
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
                <AppointmentInfoDialog open={openInfoDialog} onClose={() => setOpenInfoDialog(false)} appointment={appointmentData} onDelete={() => {}} />
                {/* Staff Booking Panel */}
                {showBookingPanel && (
                    <StaffBookingPanel
                        selectedSlot={selectedSlot}
                        onClose={() => {
                            setShowBookingPanel(false);
                            setSelectedSlot(null);
                        }}
                        onConfirmBooking={handleConfirmBooking}
                        existingAppointments={appointments}
                    />
                )}
        </div>


    );
}

export default AdminCalendar;