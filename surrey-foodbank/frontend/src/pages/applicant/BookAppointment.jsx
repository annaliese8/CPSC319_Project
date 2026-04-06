// Claude.AI was used in page formatting and debugging
import { useEffect, useState } from "react";
import { useBookingStyles } from "./Bookingstyles";
import {
  Stepper,
  StepChooseTime,
  StepReview,
  StepThankYou,
} from "../../components/BookingSteps";
import { useNavigate } from "react-router-dom";
import ApplicantTopBar from "../../components/ApplicantTopBar";
import { Typography } from "@mui/material";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { INELIGIBLE_STATUS_OPTIONS, ELIGIBLE_CITIES } from "../../components/RegistrationFields";
import IneligibleStatusDialog from "../../components/IneligibleStatusDialog";
import IneligibleCityDialog from "../../components/IneligibleCityDialog";
import { normalizeCity } from "../../utils/Normalize";

function getApiBaseUrl() {
  const envBase = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || "").trim();
  if (envBase) return envBase.replace(/\/$/, "");
  return import.meta.env.DEV ? "http://localhost:3000" : "";
}

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
  const handleLogout = () => navigate(`/applicant/home`);

  const [form, setForm] = useState({});
  const [accessToken, setAccessToken] = useState("");
  const [loadError, setLoadError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showIneligibleStatusDialog, setShowIneligibleStatusDialog] = useState(false);
  const [ineligibleStatus, setIneligibleStatus] = useState("");
  const [showIneligibleCityDialog, setShowIneligibleCityDialog] = useState(false);
  const [ineligibleCity, setIneligibleCity] = useState("");
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [existingSlot, setExistingSlot] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRegistration() {
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        navigate("/applicant/login", { replace: true });
        return;
      }

      if (isMounted) {
        setAccessToken(token);
      }
      const apiBase = getApiBaseUrl();

      try {
        const [regResponse, apptResponse] = await Promise.all([
          fetch(`${apiBase}/api/applicant/registration`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiBase}/api/applicant/appointment`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const regResult = await regResponse.json().catch(() => null);
        const apptResult = await apptResponse.json().catch(() => null);
        if (!isMounted) return;

        if (!regResponse.ok) {
          setLoadError(regResult?.error || "Unable to load registration details.");
          return;
        }

        setForm(regResult?.data?.registration || {});

        // Derive existing slot for highlighting in the calendar
        const appt = apptResult?.data?.appointment;
        if (appt?.startTime && appt?.date) {
          const d = new Date(appt.date);
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          setExistingSlot({ day: appt.day, time: appt.startTime, dateStr, duration: appt.duration ?? 15 });
        }
      } catch (_error) {
        if (!isMounted) return;
        setLoadError("Unable to load registration details.");
      } finally {
        if (isMounted) {
          setIsLoadingForm(false);
        }
      }
    }

    loadRegistration();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Navigation
  const [step, setStep] = useState(0);

  const createHold = async (slot, token) => {
    if (!slot || !token) return;
    const apiBase = getApiBaseUrl();
    const duration = Number((form.householdMembers?.length ?? 0) + 1) >= 5 ? 30 : 15;
    try {
      await fetch(`${apiBase}/api/applicant/hold`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: slot.date.toISOString(),
          startTime: slot.time,
          duration,
        }),
      });
    } catch (_err) {
      // Non-critical — booking will still check availability on confirm
    }
  };

  const releaseHoldRequest = (token, { keepalive = false } = {}) => {
    if (!token) return;
    const apiBase = getApiBaseUrl();
    return fetch(`${apiBase}/api/applicant/hold`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      keepalive,
    }).catch(() => {});
  };

  // Release the hold if the user closes the tab or navigates away while on the review step
  useEffect(() => {
    if (step !== 1) return;

    const handleUnload = () => {
      releaseHoldRequest(accessToken, { keepalive: true });
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      // Also fires on React Router navigation away from this page while on step 1
      releaseHoldRequest(accessToken);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, accessToken]);

  const next = async () => {
    if (step === 0) {
      await createHold(selectedSlot, accessToken);
    }
    setStep((s) => s + 1);
  };
  const prev = async () => {
    if (step === 1) {
      await releaseHoldRequest(accessToken);
    }
    setStep((s) => s - 1);
  };

  // Time Slot
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleFormChange = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormDirty(true);
  };

  // Confirm: save registration edits + appointment, then advance to Thank You
  const handleConfirm = async () => {
    if (!selectedSlot || !accessToken) return;

    // Check eligibility before saving — same checks as profile page
    if (INELIGIBLE_STATUS_OPTIONS.includes(form.status_in_canada)) {
      setIneligibleStatus(form.status_in_canada);
      document.activeElement?.blur();
      setShowIneligibleStatusDialog(true);
      return;
    }
    const normalizedCity = normalizeCity(form.city);
    if (form.city && !ELIGIBLE_CITIES.some((eligible) => normalizedCity.includes(eligible))) {
      setIneligibleCity(form.city);
      document.activeElement?.blur();
      setShowIneligibleCityDialog(true);
      return;
    }

    setIsSaving(true);
    setLoadError("");
    setFormErrors({});

    const apiBase = getApiBaseUrl();

    // Save registration edits if the user changed anything
    if (formDirty) {
      const registerPayload = {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        street_addr: form.street_addr,
        city: form.city,
        postal_code: form.postal_code,
        status_in_canada: form.status_in_canada,
        tiny_bundles_program:
          form.tiny_bundles_program === true || form.tiny_bundles_program === "yes"
            ? "yes"
            : "no",
        language: form.language,
      };

      try {
        const regResponse = await fetch(`${apiBase}/api/applicant/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(registerPayload),
        });
        const regResult = await regResponse.json().catch(() => null);
        if (!regResponse.ok) {
          const details = regResult?.details;
          if (details && typeof details === "object" && Object.keys(details).length > 0) {
            const keyMap = {
              firstName: "first_name",
              lastName: "last_name",
              streetAddress: "street_addr",
              statusInCanada: "status_in_canada",
              postalCode: "postal_code",
              phone: "phone",
              province: "province",
              language: "language",
              city: "city",
            };
            const mapped = {};
            for (const [k, v] of Object.entries(details)) {
              mapped[keyMap[k] || k] = v;
            }
            setFormErrors(mapped);
          } else {
            setLoadError(regResult?.error || "Unable to save registration changes.");
          }
          setIsSaving(false);
          return;
        }
      } catch (_error) {
        setLoadError("Unable to save registration changes.");
        setIsSaving(false);
        return;
      }
    }

    // Save the appointment
    const duration = Number((form.householdMembers?.length ?? 0) + 1) >= 5 ? 30 : 15;
    const payload = {
      day: selectedSlot.date.toLocaleDateString("en-US", { weekday: "long" }),
      date: selectedSlot.date.toISOString(),
      startTime: selectedSlot.time,
      duration,
      appointmentStatus: "Booked",
    };

    try {
      const response = await fetch(`${apiBase}/api/applicant/appointment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setLoadError(result?.error || "Unable to save appointment.");
        setIsSaving(false);
        return;
      }
    } catch (_error) {
      setLoadError("Unable to save appointment.");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    next();
  };

  const handleDone = () => {
    navigate("/applicant/profile", { replace: true });
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
          {isLoadingForm ? (
            <Typography sx={{ px: 3, py: 2 }} color="text.secondary">
              Loading registration details...
            </Typography>
          ) : null}
          {loadError ? (
            <Typography sx={{ px: 3, pb: 2 }} color="error">
              {loadError}
            </Typography>
          ) : null}
          {step === 0 && (
            <StepChooseTime
              form={form}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              onClearSlot={() => setSelectedSlot(null)}
              onBack={() => navigate("/applicant/profile")}
              onNext={selectedSlot && !isLoadingForm ? next : undefined}
              existingSlot={existingSlot}
            />
          )}

          {step === 1 && (
            <>
              <StepReview
                form={form}
                selectedSlot={selectedSlot}
                onBack={prev}
                onConfirm={handleConfirm}
                onTimerExpired={async () => {
                  await releaseHoldRequest(accessToken);
                  setSelectedSlot(null);
                  setStep(0);
                }}
                onChange={handleFormChange}
                errors={formErrors}
                isConfirming={isSaving}
              />
            </>
          )}

          {step === 2 && (
            <StepThankYou selectedSlot={selectedSlot} onDone={handleDone} />
          )}
        </div>
      </div>
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
    </div>
  );
}

// Claude.AI was used in page formatting and debugging
