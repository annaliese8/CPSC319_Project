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
import { useNavigate } from 'react-router-dom';
import ApplicantTopBar from "../../components/ApplicantTopBar";    


/**
 * BookAppointment
 * Step order:
 *   0  Personal Info
 *   1  Choose Time
 *   2  Review
 *   3  Thank You
 */
export default function BookAppointment() {
  useBookingStyles();

  const navigate = useNavigate();
  const handleLogout = () => navigate(`/applicant/home`);

  // Navigation
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  // Step 1: Personal Info
  const [form, setForm] = useState({
    name: "", address: "", status: "",  householdSize: "", tinyBundles: "no", language: "English",
  });
  const [formErrors, setFormErrors] = useState({});

  const handleFormChange = (field, value) => {
  setForm((f) => ({ ...f, [field]: value }));
  setFormErrors((e) => ({ ...e, [field]: undefined }));
};

  const handlePersonalNext = () => {
    const errors = {};
    if (!form.name.trim())                          errors.name          = "Required";
    if (!form.address.trim())                       errors.address       = "Required";
    if (!form.status)                               errors.status        = "Required";
    if (!form.householdSize || Number(form.householdSize) < 1)
                                                    errors.householdSize = "Please enter a valid household size (1 or more)";
    setFormErrors(errors);
    if (!Object.keys(errors).length) next();
  };

 // Time Slot
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Confirm 
  const handleConfirm = () => next();

  const handleDone = () => {
    navigate("/applicant/profile", {
      state: {
        name: form.name,
        address: form.address,
        statusInCanada: form.status,
        applyingToTinyBundles: form.tinyBundles,
        householdMembers: form.householdSize,
        dateLabel: selectedSlot.date.toLocaleDateString("en-US", {
          weekday: "long", month: "long", day: "numeric", year: "numeric",
        }),
        timeLabel: `${formatTime(selectedSlot.time)} – ${formatTime(addMinutes(selectedSlot.time, selectedSlot.interval ?? 15))}`,
      },
    });
  };

  // Render
  return (
    <div className="ba-shell">
      <ApplicantTopBar onLogout={handleLogout} />

      <div className="ba-card-wrap">
        <div className="ba-card">
          <div className="ba-banner">
            <h1>Book an Appointment</h1>
          </div>

          <Stepper currentStep={step} />

          {step === 0 && (
            <StepPersonalInfo
              form={form}
               errors={formErrors}
                onChange={handleFormChange}
                onNext={handlePersonalNext}
            />
          )}

          {step === 1 && (
            <StepChooseTime
              form={form}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              onClearSlot={() => setSelectedSlot(null)}
              onBack={prev}
              onNext={selectedSlot ? next : undefined}
            />
          )}

          {step === 2 && (
            <StepReview
              form={form}
              selectedSlot={selectedSlot}
              onBack={prev}
              onConfirm={handleConfirm}
            />
          )}

          {step === 3 && (
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