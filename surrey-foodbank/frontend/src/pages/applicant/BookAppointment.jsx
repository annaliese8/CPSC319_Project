// Claude.AI was used in page formatting and debugging
import { useState } from "react";
import { useBookingStyles } from "./Bookingstyles";
import {
  Stepper,
  StepPersonalInfo,
  StepChooseTime,
  StepReview,
  StepThankYou,
  formatTime,      
  addMinutes, 
} from "../../components/BookingSteps";
import { useNavigate, useLocation } from 'react-router-dom';
import ApplicantTopBar from "../../components/ApplicantTopBar";    

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

  // Profile data passed in via router state from the profile page
  // Falls back to empty strings so the page never hard-crashes if navigated to directly
  const profileData = location.state ?? {};

  // Navigation
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

 // Time Slot
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Confirm 
  const handleConfirm = () => next();

  const handleDone = () => {
    navigate("/applicant/profile", {
      state: {
        name: profileData.name,
        address: profileData.address,
        statusInCanada: profileData.status,
        applyingToTinyBundles: profileData.tinyBundles,
        householdMembers: profileData.householdSize,
        dateLabel: selectedSlot.date.toLocaleDateString("en-US", {
          weekday: "long", month: "long", day: "numeric", year: "numeric",
        }),
        timeLabel: `${formatTime(selectedSlot.time)} – ${formatTime(addMinutes(selectedSlot.time, selectedSlot.interval ?? 15))}`,
      },
    });
  };

  const stepperStep = step + 1;

  // Render
  return (
    <div className="ba-shell">
      <ApplicantTopBar onLogout={handleLogout} />

      <div className="ba-card-wrap">
        <div className="ba-card">
          <div className="ba-banner">
            <h1>Book an Appointment</h1>
          </div>

          <Stepper currentStep={stepperStep} />

          {step === 0 && (
            <StepChooseTime
              form={profileData}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              onClearSlot={() => setSelectedSlot(null)}
              onBack={() => navigate("/applicant/profile", { state: profileData })}
              onNext={selectedSlot ? next : undefined}
            />
          )}

          {step === 1 && (
            <StepReview
              form={profileData}
              selectedSlot={selectedSlot}
              onBack={prev}
              onConfirm={handleConfirm}
            />
          )}

          {step === 2 && (
            <StepThankYou
              selectedSlot={selectedSlot}
                  onDone={handleDone}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Claude.AI was used in page formatting and debugging