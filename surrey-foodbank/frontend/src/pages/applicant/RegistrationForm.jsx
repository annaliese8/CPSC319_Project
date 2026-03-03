import { useState } from "react";
import { useBookingStyles } from "./Bookingstyles";
import {
  Stepper,
  StepPersonalInfo,
} from "../../components/BookingSteps";
import { useNavigate } from "react-router-dom";
import ApplicantTopBar from "../../components/ApplicantTopBar";

export default function Register() {
  useBookingStyles();
  const navigate = useNavigate();
  const handleLogout = () => navigate("/applicant/home");

  const [form, setForm] = useState({
    name: "", address: "", phone: "", status: "",  householdSize: "", tinyBundles: "no", language: "English",
  });
  const [formErrors, setFormErrors] = useState({});

  const isValidPhone = (value) => value.replace(/\D/g, "").length >= 10;

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFormErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handlePersonalNext = () => {
    const errors = {};
    if (!form.name.trim())                         errors.name          = "Required";
    if (!form.address.trim())                      errors.address       = "Required";
    if (!form.phone.trim())                        errors.phone         = "Required";
    else if (!isValidPhone(form.phone))            errors.phone         = "Please enter a valid phone number (at least 10 digits)";
    if (!form.status)                              errors.status        = "Required";
    if (!form.householdSize || Number(form.householdSize) < 1)
      errors.householdSize = "Please enter a valid household size (1 or more)";
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    navigate("/applicant/profile", {
      state: {
        name: form.name,
        address: form.address,
        statusInCanada: form.status,
        applyingToTinyBundles: form.tinyBundles,
        householdMembers: form.householdSize,
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