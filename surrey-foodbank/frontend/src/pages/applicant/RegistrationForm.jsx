import { useState } from "react";
import { useBookingStyles } from "./Bookingstyles";
import {
  Stepper,
  StepPersonalInfo,
  StepFamilyMembers,
  StepSignupReview,
  SIGNUP_STEPS,
} from "../../components/BookingSteps";
import { useNavigate } from "react-router-dom";
import ApplicantTopBar from "../../components/ApplicantTopBar";
import { validateRegistrationForm } from "../../utils/ValidateRegistrationForm";
import { validateHouseholdMembers } from "../../utils/ValidateHouseholdMembers";
import { Snackbar, Alert } from "@mui/material";

export default function Register() {
  useBookingStyles();
  const navigate = useNavigate();
  const handleLogout = () => navigate("/applicant/home");

  const activeUser = JSON.parse(localStorage.getItem("activeUser") || "null");
  const applicantKey = activeUser?.email
    ? `applicant_${activeUser.email}`
    : null;
  const stored = applicantKey
    ? JSON.parse(localStorage.getItem(applicantKey) || "{}")
    : {};
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: stored.firstName ?? "",
    lastName: stored.lastName ?? "",
    streetAddress: stored.streetAddress ?? "",
    city: stored.city ?? "",
    province: stored.province ?? "British Columbia",
    postalCode: stored.postalCode ?? "",
    phone: stored.phone ?? "",
    statusInCanada: stored.statusInCanada ?? "",
    householdMembers: stored.householdMembers ?? "",
    applyingToTinyBundles: stored.applyingToTinyBundles ?? "no",
    language: stored.language ?? "English",
  });
  const [familyMembers, setFamilyMembers] = useState(
    stored.familyMembers ?? [],
  );
  const [formErrors, setFormErrors] = useState({});
  const [memberErrors, setMemberErrors] = useState({});
  const [savedToast, setSavedToast] = useState(false);

  // ── Step 0: Personal Info ──────────────────────────────────────────────────

  const handleFormChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFormErrors((err) => ({ ...err, [field]: undefined }));
  };

  const handlePersonalNext = () => {
    const errors = validateRegistrationForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    // Save to applicant record on successful validation
    if (applicantKey) {
      const existing = JSON.parse(localStorage.getItem(applicantKey) || "{}");
      localStorage.setItem(
        applicantKey,
        JSON.stringify({ ...existing, ...form }),
      );
      setSavedToast(true);
    }

    setStep(1);
  };

  // ── Step 1: Family Members ─────────────────────────────────────────────────

  const handleFamilyNext = () => {
    const errors = validateHouseholdMembers(familyMembers);
    setMemberErrors(errors);
    if (Object.keys(errors).length) return;
    // Save household members to applicant record
    if (applicantKey) {
      const existing = JSON.parse(localStorage.getItem(applicantKey) || "{}");
      localStorage.setItem(
        applicantKey,
        JSON.stringify({ ...existing, familyMembers }),
      );
      setSavedToast(true);
    }

    setStep(2);
  };

  // ── Save Progress ────────────────────────────────────────────────────────────

  const handleSaveProgress = () => {
    // saveSignupDraft(step, form, familyMembers);
    setSavedToast(true);
  };

  // ── Step 2: Review → straight to profile ──────────────────────────────────

  const handleConfirm = () => {
    if (applicantKey) {
      const existing = JSON.parse(localStorage.getItem(applicantKey) || "{}");
      localStorage.setItem(
        applicantKey,
        JSON.stringify({
          ...existing,
          ...form,
          familyMembers,
          registrationComplete: true,
        }),
      );
    }

    // clearSignupDraft();

    navigate("/applicant/profile", {
      state: {
        firstName: form.firstName,
        lastName: form.lastName,
        name: `${form.firstName} ${form.lastName}`,
        streetAddress: form.streetAddress,
        city: form.city,
        province: form.province,
        postalCode: form.postalCode,
        address: `${form.streetAddress}, ${form.city}, ${form.province}, ${form.postalCode}`,
        phone: form.phone,
        statusInCanada: form.statusInCanada,
        applyingToTinyBundles: form.applyingToTinyBundles,
        householdMembers: form.householdMembers,
        language: form.language,
        familyMembers,
      },
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="ba-shell">
      <title>Registration | Surrey Food Bank</title>
      <ApplicantTopBar onLogout={handleLogout} />
      <div className="ba-card-wrap">
        <div className="ba-card">
          <div className="ba-banner">
            <h1>Registration</h1>
          </div>

          <Stepper currentStep={step} steps={SIGNUP_STEPS} />

          {step === 0 && (
            <StepPersonalInfo
              form={form}
              errors={formErrors}
              onChange={handleFormChange}
              onNext={handlePersonalNext}
            />
          )}

          {step === 1 && (
            <StepFamilyMembers
              familyMembers={familyMembers}
              onChange={setFamilyMembers}
              onBack={() => setStep(0)}
              onNext={handleFamilyNext}
              errors={memberErrors}
            />
          )}

          {step === 2 && (
            <StepSignupReview
              form={form}
              familyMembers={familyMembers}
              onBack={() => setStep(1)}
              onConfirm={handleConfirm}
            />
          )}
        </div>
      </div>

      <Snackbar
        open={savedToast}
        autoHideDuration={5000}
        onClose={() => setSavedToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{ fontWeight: 600, fontSize: 14 }}
        >
          Progress saved
        </Alert>
      </Snackbar>
    </div>
  );
}

// Claude.AI was used in page formatting and debugging
