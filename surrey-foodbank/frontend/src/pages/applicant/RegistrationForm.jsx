import { useState } from "react";
import { useBookingStyles } from "./Bookingstyles";
import { Stepper, StepPersonalInfo } from "../../components/BookingSteps";
import { useNavigate } from "react-router-dom";
import ApplicantTopBar from "../../components/ApplicantTopBar";
import { validateRegistrationForm } from "../../utils/ValidateRegistrationForm";

export default function Register() {
  useBookingStyles();
  const navigate = useNavigate();
  const handleLogout = () => navigate("/applicant/home");

  const [form, setForm] = useState({
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
  const [formErrors, setFormErrors] = useState({});

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFormErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handlePersonalNext = () => {
    // Check if form fields are valid and set errors
    const errors = validateRegistrationForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    // Persist to localStorage under the activeUser key so RegistrationFormInfo
    // and BookAppointment can read the same data without relying solely on router state
    const activeUser = JSON.parse(localStorage.getItem("activeUser") || "null");
    const applicantKey = activeUser?.email
      ? `applicant_${activeUser.email}`
      : null;
    if (applicantKey) {
      const existing = JSON.parse(localStorage.getItem(applicantKey) || "{}");
      localStorage.setItem(
        applicantKey,
        JSON.stringify({ ...existing, ...form }),
      );
    }

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
      },
    });
  };

  return (
    <div className="ba-shell">
      <ApplicantTopBar onLogout={handleLogout} />
      <div className="ba-card-wrap">
        <div className="ba-card">
          <div className="ba-banner">
            <h1>Registration</h1>
          </div>
          <Stepper currentStep={0} />
          <StepPersonalInfo
            form={form}
            errors={formErrors}
            onChange={handleFormChange}
            onNext={handlePersonalNext}
          />
        </div>
      </div>
    </div>
  );
}

// Claude.AI was used in page formatting and debugging
