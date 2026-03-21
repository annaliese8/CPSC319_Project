import { useState, useEffect } from "react";
import { useBookingStyles } from "./Bookingstyles";
import {
  Stepper,
  StepPersonalInfo,
  StepFamilyMembers,
  StepSignupReview,
  SIGNUP_STEPS,
  saveSignupDraft,
  loadSignupDraft,
  clearSignupDraft,
} from "../../components/BookingSteps";
import { useNavigate } from "react-router-dom";
import ApplicantTopBar from "../../components/ApplicantTopBar";
import { validateRegistrationForm } from "../../utils/ValidateRegistrationForm";
import { Button, Snackbar, Alert, Divider } from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";

export default function Register() {
  useBookingStyles();
  const navigate = useNavigate();
  const handleLogout = () => navigate("/applicant/home");

  const draft = loadSignupDraft();

  const [step, setStep] = useState(draft?.step ?? 0);
  const [form, setForm] = useState(draft?.form ?? {
    firstName: "",
    lastName: "",
    streetAddress: "",
    city: "",
    province: "British Columbia",
    postalCode: "",
    phone: "",
    statusInCanada: "",
    householdMembers: "",
    applyingToTinyBundles: "no",
    language: "English",
  });
  const [familyMembers, setFamilyMembers] = useState(draft?.familyMembers ?? []);
  const [formErrors, setFormErrors] = useState({});
  const [memberErrors, setMemberErrors] = useState({});
  const [savedToast, setSavedToast] = useState(false);

  // // Auto-save silently on every change
  // useEffect(() => {
  //   saveSignupDraft(step, form, familyMembers);
  // }, [step, form, familyMembers]);

  // ── Step 0: Personal Info ──────────────────────────────────────────────────

  const handleFormChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFormErrors((err) => ({ ...err, [field]: undefined }));
  };

  const handlePersonalNext = () => {
    const errors = validateRegistrationForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    setStep(1);
  };

  // ── Step 1: Family Members ─────────────────────────────────────────────────

  const validateFamilyMembers = () => {
    const newErrors = {};
    familyMembers.forEach((m) => {
      const mErr = {};
      if (!m.firstName?.trim()) mErr.firstName = "Required";
      if (!m.lastName?.trim()) mErr.lastName = "Required";
      if (!m.ageGroup) mErr.ageGroup = "Please select an age group";
      if (Object.keys(mErr).length) newErrors[m.id] = mErr;
    });
    setMemberErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFamilyNext = () => {
    if (!validateFamilyMembers()) return;
    setStep(2);
  };

  // ── Save Progress ────────────────────────────────────────────────────────────

  const handleSaveProgress = () => {
    saveSignupDraft(step, form, familyMembers);
    setSavedToast(true);
  };

  // ── Step 2: Review → straight to profile ──────────────────────────────────

  const handleConfirm = () => {
    const activeUser = JSON.parse(localStorage.getItem("activeUser") || "null");
    const applicantKey = activeUser?.email ? `applicant_${activeUser.email}` : null;

    if (applicantKey) {
      const existing = JSON.parse(localStorage.getItem(applicantKey) || "{}");
      localStorage.setItem(
        applicantKey,
        JSON.stringify({ ...existing, ...form, familyMembers }),
      );
    }

    clearSignupDraft();

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

          {/* Save Progress — visible on steps 0 and 1, not on review */}
          {step < 2 && (
            <>
              <Divider sx={{ mx: 3, borderColor: "#f0f0f0" }} />
              <div style={{ padding: "16px 24px 24px" }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<BookmarkIcon />}
                  onClick={handleSaveProgress}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: 15,
                    borderRadius: "10px",
                    py: 1.4,
                    borderColor: "#d0d0d0",
                    color: "#666",
                    "&:hover": {
                      borderColor: "var(--teal, #009688)",
                      color: "var(--teal, #009688)",
                      background: "rgba(0,150,136,0.04)",
                    },
                  }}
                >
                  Save Progress
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <Snackbar
        open={savedToast}
        autoHideDuration={5000}
        onClose={() => setSavedToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600, fontSize: 14 }}>
          ✓ Progress saved — feel free to log out and continue later.
        </Alert>
      </Snackbar>
    </div>
  );
}

// Claude.AI was used in page formatting and debugging
