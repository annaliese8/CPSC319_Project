import { useEffect, useState } from "react";
import { useBookingStyles } from "./Bookingstyles";
import {
  Stepper,
  StepPersonalInfo,
  StepHouseholdMembers,
  StepSignupReview,
  SIGNUP_STEPS,
} from "../../components/BookingSteps";
import { useNavigate } from "react-router-dom";
import ApplicantTopBar from "../../components/ApplicantTopBar";
import { validateRegistrationForm } from "../../utils/ValidateRegistrationForm";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { INELIGIBLE_STATUS_OPTIONS, ELIGIBLE_CITIES } from "../../components/RegistrationFields";
import IneligibleStatusDialog from "../../components/IneligibleStatusDialog";
import IneligibleCityDialog from "../../components/IneligibleCityDialog";
import IneligibleAgeDialog from "../../components/IneligibleAgeDialog";
import { normalizeCity } from "../../utils/Normalize";

function getApiBaseUrl() {
  const envBase = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || "").trim();
  if (envBase) return envBase.replace(/\/$/, "");
  return import.meta.env.DEV ? "http://localhost:3000" : "";
}
import { validateHouseholdMembers } from "../../utils/ValidateHouseholdMembers";
import { Alert, Snackbar, Typography } from "@mui/material";

function toValidationForm(form) {
  return {
    firstName: form.first_name ?? "",
    lastName: form.last_name ?? "",
    streetAddress: form.street_addr ?? "",
    city: form.city ?? "",
    province: form.province ?? "",
    postalCode: form.postal_code ?? "",
    phone: form.phone ?? "",
    statusInCanada: form.status_in_canada ?? "",
    language: form.language ?? "",
    applyingToTinyBundles: form.tiny_bundles_program ? "yes" : "no",
    over_eighteen: form.over_eighteen // not stored in the database
  };
}

function toUiErrors(validationErrors) {
  return {
    ...validationErrors,
    first_name: validationErrors.firstName,
    last_name: validationErrors.lastName,
    street_addr: validationErrors.streetAddress,
    postal_code: validationErrors.postalCode,
    status_in_canada: validationErrors.statusInCanada,
  };
}

function toRegistrationDbPayload(form) {
  return {
    first_name: form.first_name ?? "",
    last_name: form.last_name ?? "",
    street_addr: form.street_addr ?? "",
    city: form.city ?? "",
    postal_code: form.postal_code ?? "",
    phone: form.phone ?? "",
    status_in_canada: form.status_in_canada ?? "",
    tiny_bundles_program: form.tiny_bundles_program ? "yes" : "no",
    language: form.language ?? ""
  };
}

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
    first_name: stored.first_name ?? "",
    last_name: stored.last_name ?? "",
    street_addr: stored.street_addr ?? "",
    city: stored.city ?? "",
    province: stored.province?.trim() || "British Columbia",
    postal_code: stored.postal_code ?? "",
    phone: stored.phone ?? "",
    status_in_canada: stored.status_in_canada ?? "",
    tiny_bundles_program: stored.tiny_bundles_program ?? false,
    language: stored.language?.trim() || "English",
    over_eighteen: stored.over_eighteen ?? "true", // not stored in the database
  });
  const [householdMembers, setHouseholdMembers] = useState(
    [],
  );
  const [formErrors, setFormErrors] = useState({});
  const [memberErrors, setMemberErrors] = useState({});
  const [savedToast, setSavedToast] = useState(false);

  // ── Step 0: Personal Info ──────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showIneligibleStatusDialog, setShowIneligibleStatusDialog] = useState(false);
  const [ineligibleStatus, setIneligibleStatus] = useState("");
  const [showIneligibleCityDialog, setShowIneligibleCityDialog] = useState(false);
  const [ineligibleCity, setIneligibleCity] = useState("");
  const [showIneligibleAgeDialog, setShowIneligibleAgeDialog] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (!data?.session?.user) {
        navigate("/applicant/login", { replace: true });
        return;
      }

      // Redirect back to profile if registration was already completed
      const storedData = applicantKey
        ? JSON.parse(localStorage.getItem(applicantKey) || "{}")
        : {};
      if (storedData.registrationComplete) {
        navigate("/applicant/profile", { replace: true });
        return;
      }

      // Load household members already saved to the database
      const accessToken = data.session.access_token;
      const apiBase = getApiBaseUrl();
      try {
        const res = await fetch(`${apiBase}/api/applicant/registration`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const json = await res.json();
          const members = json?.data?.registration?.householdMembers;
          if (isMounted && Array.isArray(members) && members.length > 0) {
            setHouseholdMembers(
              members.map((m) => ({
                id: m.id ?? crypto.randomUUID(),
                firstName: m.firstName ?? "",
                lastName: m.lastName ?? "",
                ageGroup: m.ageGroup ?? "",
              }))
            );
          }
        }
      } catch (_) {
        // Non-fatal — user can still add members manually
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleFormChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFormErrors((err) => ({ ...err, [field]: undefined }));
  };

  const handlePersonalNext = async () => {
    if (isSubmitting) return;
    setSubmitError("");

    // Check if form fields are valid and set errors
    const errors = validateRegistrationForm(toValidationForm(form));
    setFormErrors(toUiErrors(errors));
    if (Object.keys(errors).length) return;

    // Check if status in Canada is ineligible, and show dialog if so
    if (INELIGIBLE_STATUS_OPTIONS.includes(form.status_in_canada)) {
      setIneligibleStatus(form.status_in_canada);
      document.activeElement?.blur();
      setShowIneligibleStatusDialog(true);
      return;
    }

    // Check if city is elibible, and show dialog if so
    const normalized_city = normalizeCity(form.city);
    if (!ELIGIBLE_CITIES.some((eligible) =>
      normalized_city.includes(eligible)
    )) {
      setIneligibleCity(form.city);
      document.activeElement?.blur();
      setShowIneligibleCityDialog(true);
      return;
    }

    // Check if applicant is under eighteen years old, and show dialog if so
    if (!form.over_eighteen) {
      document.activeElement?.blur();
      setShowIneligibleAgeDialog(true);
      return;
    }

    setIsSubmitting(true);

    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    let accessToken = data?.session?.access_token;

    if (!accessToken) {
      const { data: refreshData } = await supabase.auth.refreshSession();
      accessToken = refreshData?.session?.access_token;
    }

    if (!accessToken) {
      setIsSubmitting(false);
      setSubmitError("Your session has expired. Please log in again.");
      navigate("/applicant/login", { replace: true });
      return;
    }

    const apiBase = getApiBaseUrl();

    try {
      const response = await fetch(`${apiBase}/api/applicant/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(toRegistrationDbPayload(form)),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          result?.error ||
          "Unable to save your registration right now. Please try again.";
        setSubmitError(message);
        setIsSubmitting(false);
        return;
      }
      setSavedToast(true);
    } catch (_error) {
      setSubmitError("Unable to save your registration right now. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // setIsSubmitting(true);

    // const supabase = getSupabaseClient();
    // const { data } = await supabase.auth.getSession();
    // const accessToken = data?.session?.access_token;

    // if (!accessToken) {
    //   setIsSubmitting(false);
    //   setSubmitError("Your session has expired. Please log in again.");
    //   navigate("/applicant/login", { replace: true });
    //   return;
    // }

    // const apiBase = getApiBaseUrl();

    // try {
    //   const response = await fetch(`${apiBase}/api/applicant/register`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //     body: JSON.stringify(toRegistrationDbPayload(form, householdMembers)),
    //   });

    //   const result = await response.json().catch(() => null);
    //   if (!response.ok) {
    //     const message =
    //       result?.error ||
    //       "Unable to save your registration right now. Please try again.";
    //     setSubmitError(message);
    //     setIsSubmitting(false);
    //     return;
    //   }
    // } catch (_error) {
    //   setSubmitError("Unable to save your registration right now. Please try again.");
    //   setIsSubmitting(false);
    //   return;
    // }

    // Save to applicant record on successful validation
    if (applicantKey) {
      const existing = JSON.parse(localStorage.getItem(applicantKey) || "{}");
      localStorage.setItem(
        applicantKey,
        JSON.stringify({ ...existing, ...form }),
      );
    }

    setIsSubmitting(false);
    setStep(1);
  };

  // ── Step 1: Household Members ─────────────────────────────────────────────────

  const handleHouseholdNext = async () => {
    const errors = validateHouseholdMembers(householdMembers);
    setMemberErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitError("");
    setIsSubmitting(true);

    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    let accessToken = data?.session?.access_token;

    if (!accessToken) {
      const { data: refreshData } = await supabase.auth.refreshSession();
      accessToken = refreshData?.session?.access_token;
    }

    if (!accessToken) {
      setIsSubmitting(false);
      setSubmitError("Your session has expired. Please log in again.");
      navigate("/applicant/login", { replace: true });
      return;
    }

    const apiBase = getApiBaseUrl();

    try {
      const response = await fetch(`${apiBase}/api/applicant/household-members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ householdMembers }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          result?.error ||
          "Unable to save household members right now. Please try again.";
        setSubmitError(message);
        setIsSubmitting(false);
        return;
      }
    } catch (_error) {
      setSubmitError("Unable to save household members right now. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setSavedToast(true);

    setIsSubmitting(false);
    setStep(2);
  };

  // ── Save Progress ────────────────────────────────────────────────────────────

  const handleSaveProgress = () => {
    setSavedToast(true);
  };

  // ── Step 2: Review → straight to profile ──────────────────────────────────

  const handleConfirm = () => {
    // Re-run eligibility checks in case the user went back and changed values
    if (INELIGIBLE_STATUS_OPTIONS.includes(form.status_in_canada)) {
      setIneligibleStatus(form.status_in_canada);
      document.activeElement?.blur();
      setShowIneligibleStatusDialog(true);
      return;
    }

    const normalized_city = normalizeCity(form.city);
    if (!ELIGIBLE_CITIES.some((eligible) => normalized_city.includes(eligible))) {
      setIneligibleCity(form.city);
      document.activeElement?.blur();
      setShowIneligibleCityDialog(true);
      return;
    }

    if (applicantKey) {
      const existing = JSON.parse(localStorage.getItem(applicantKey) || "{}");
      localStorage.setItem(
        applicantKey,
        JSON.stringify({
          ...existing,
          ...form,
          registrationComplete: true,
        }),
      );
    }

    setIsSubmitting(false);

    navigate("/applicant/profile", {
      state: {
        first_name: form.first_name,
        last_name: form.last_name,
        name: `${form.first_name} ${form.last_name}`,
        street_addr: form.street_addr,
        city: form.city,
        province: form.province,
        postal_code: form.postal_code,
        address: `${form.street_addr}, ${form.city}, ${form.province}, ${form.postal_code}`,
        phone: form.phone,
        status_in_canada: form.status_in_canada,
        applyingToTinyBundles: form.tiny_bundles_program ? "yes" : "no",
        language: form.language,
        householdMembers: householdMembers,
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
            <Typography variant="h1">Registration</Typography>
          </div>

          <Stepper currentStep={step} steps={SIGNUP_STEPS} />

          {step === 0 && (
            <StepPersonalInfo
              form={form}
              errors={formErrors}
              onChange={handleFormChange}
              onNext={handlePersonalNext}
              isSubmitting={isSubmitting}
            />
          )}

          {step === 1 && (
            <StepHouseholdMembers
              householdMembers={householdMembers}
              onChange={setHouseholdMembers}
              onBack={() => setStep(0)}
              onNext={handleHouseholdNext}
              errors={memberErrors}
            />
          )}

          {step === 2 && (
            <StepSignupReview
              form={form}
              householdMembers={householdMembers}
              onBack={() => setStep(1)}
              onConfirm={handleConfirm}
            />
          )}
          {isSubmitting ? (
            <p style={{ margin: "8px 20px 0", color: "#6b7280" }}>
              Saving your registration information...
            </p>
          ) : null}
          {submitError ? (
            <p style={{ margin: "8px 20px 0", color: "#b91c1c" }}>
              {submitError}
            </p>
          ) : null}
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
      <IneligibleStatusDialog
        open={showIneligibleStatusDialog}
        onClose={() => setShowIneligibleStatusDialog(false)}
        status={ineligibleStatus}
      />
      <IneligibleCityDialog
        open={showIneligibleCityDialog}
        onClose={() => setShowIneligibleCityDialog(false)}
        city={ineligibleCity}
      />
      <IneligibleAgeDialog
        open={showIneligibleAgeDialog}
        onClose={() => setShowIneligibleAgeDialog(false)}
      />
    </div>
  );
}

// Claude.AI was used in page formatting and debugging
