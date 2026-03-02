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
import { useNavigate } from "react-router-dom";
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
    name: "",
    address: "",
    phone: "",
    status: "",
    householdSize: "",
    tinyBundles: "no",
    language: "English",
  });
  const [formErrors, setFormErrors] = useState({});

  const isValidPhone = (value) => value.replace(/\D/g, "").length >= 10;

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFormErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handlePersonalNext = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Required";
    if (!form.address.trim()) errors.address = "Required";
    if (!form.phone.trim()) errors.phone = "Required";
    else if (!isValidPhone(form.phone))
      errors.phone = "Please enter a valid phone number (at least 10 digits)";
    if (!form.status) errors.status = "Required";
    if (!form.householdSize || Number(form.householdSize) < 1)
      errors.householdSize =
        "Please enter a valid household size including you (1 or more)";
    setFormErrors(errors);
    if (!Object.keys(errors).length) next();
  };

  // Time Slot
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Confirm
  const handleConfirm = () => next();

  const handleDone = () => {
    const activeUser = JSON.parse(localStorage.getItem("activeUser") || "null");
    const applicantKey = activeUser?.email
      ? `applicant_${activeUser.email}`
      : null;
    const duration = Number(form.householdSize) >= 5 ? 30 : 15;

    const payload = {
      email: activeUser?.email,
      name: form.name,
      phone: form.phone,
      address: form.address,
      statusInCanada: form.status,
      applyingToTinyBundles: form.tinyBundles,
      householdMembers: form.householdSize,
      day: selectedSlot.date.toLocaleDateString("en-US", { weekday: "long" }),
      startTime: selectedSlot.time,
      duration,
      dateLabel: selectedSlot.date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      timeLabel: `${formatTime(selectedSlot.time)} – ${formatTime(addMinutes(selectedSlot.time, duration))}`,
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
            <StepThankYou selectedSlot={selectedSlot} onDone={handleDone} />
          )}
        </div>
      </div>
    </div>
  );
}

// Claude.AI was used in page formatting and debugging
