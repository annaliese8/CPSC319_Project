// Claude.AI was used in page formatting and debugging
import { useState } from "react";
import { useBookingStyles } from "./Bookingstyles";
import {
  Stepper,
  StepChooseTime,
  StepReview,
  StepThankYou,
  formatTime,
} from "../../components/BookingSteps";
import { useNavigate, useLocation } from "react-router-dom";
import ApplicantTopBar from "../../components/ApplicantTopBar";
import { Language } from "@mui/icons-material";
import { addMinutesToTime } from "../../utils/TimeUtils";

/**
 * BookAppointment
 * Step order:
 *   0  Choose Time
 *   1  Review
 *   2  Thank You
 */
export default function BookAppointment() {
  useBookingStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => navigate(`/applicant/home`);

  // Prefer localStorage data (saved via RegistrationFormInfo) over router state,
  // with router state as a fallback so the page never hard-crashes
  const activeUser = JSON.parse(localStorage.getItem("activeUser") || "null");
  const applicantKey = activeUser?.email
    ? `applicant_${activeUser.email}`
    : null;
  const savedForm = applicantKey
    ? JSON.parse(localStorage.getItem(applicantKey) || "null")
    : null;

  const form = savedForm ?? location.state ?? {};

  // Navigation
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  // Time Slot
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Confirm
  const handleConfirm = () => next();

  const handleDone = () => {
    const duration = Number(form.householdMembers.length + 1) >= 5 ? 30 : 15;
    const payload = {
      email: activeUser?.email,
      firstName: form.firstName,
      lastName: form.lastName,
      name: `${form.firstName} ${form.lastName}`,
      phone: form.phone,
      streetAddress: form.streetAddress,
      city: form.city,
      postalCode: form.postalCode,
      province: form.province,
      statusInCanada: form.statusInCanada,
      applyingToTinyBundles: form.applyingToTinyBundles,
      householdMembers: form.householdMembers,
      language: form.language,
      day: selectedSlot.date.toLocaleDateString("en-US", { weekday: "long" }),
      date: selectedSlot.date.toISOString(),
      startTime: selectedSlot.time,
      duration,
      dateLabel: selectedSlot.date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      timeLabel: `${formatTime(selectedSlot.time)} – ${formatTime(addMinutesToTime(selectedSlot.time, selectedSlot.interval ?? 15))}`,
      appointmentStatus: "Booked"
    };

    if (applicantKey) {
      const existing = JSON.parse(localStorage.getItem(applicantKey) || "{}");
      localStorage.setItem(
        applicantKey,
        JSON.stringify({ ...existing, ...payload }),
      );
    }

    navigate("/applicant/profile", {
      state: payload,
    });
  };

  const stepperStep = step + 1;

  // Render
  return (
    <div className="ba-shell">
      <title>Book Appointment | Surrey Food Bank</title>
      <ApplicantTopBar onLogout={handleLogout} />

      <div className="ba-card-wrap">
        <div className="ba-card">
          <div className="ba-banner">
            <h1>Book an Appointment</h1>
          </div>
          <Stepper currentStep={stepperStep} />
          {step === 0 && (
            <StepChooseTime
              form={form}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              onClearSlot={() => setSelectedSlot(null)}
              onBack={() => navigate("/applicant/profile", { state: form })}
              onNext={selectedSlot ? next : undefined}
            />
          )}

          {step === 1 && (
            <StepReview
              form={form}
              selectedSlot={selectedSlot}
              onBack={prev}
              onConfirm={handleConfirm}
              onTimerExpired={() => {
                setSelectedSlot(null);
                setStep(0);
              }}
            />
          )}

          {step === 2 && (
            <StepThankYou selectedSlot={selectedSlot} onDone={handleDone} />
          )}
        </div>
      </div>
    </div>
  );
}

// Claude.AI was used in page formatting and debugging
