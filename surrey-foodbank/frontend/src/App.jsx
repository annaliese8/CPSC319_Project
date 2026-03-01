import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/theme";

import { Routes, Route } from "react-router-dom";
import StaffLogin from "./pages/staff/Login";
import StaffHome from "./pages/staff/Home";
import StaffApplicantInfo from "./pages/staff/ApplicantInfo";
import StaffApplicantDatabase from "./pages/staff/ApplicantDatabase";
import ApplicantLogin from "./pages/applicant/Login";
import ApplicantHome from "./pages/applicant/Home";
import ApplicantCreateAccount from "./pages/applicant/CreateAccount";
import ApplicantRegistrationForm from "./pages/applicant/RegistrationForm";
import ApplicantBookAppointment from "./pages/applicant/BookAppointment";
import ApplicantProfile from "./pages/applicant/Profile";

const staffBase = import.meta.env.VITE_STAFF_BASE;
console.log("Staff base path:", staffBase);

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Routes>
          {/* Staff routes */}

          {/* Secret staff admin */}
          <Route path={`/${staffBase}/login`} element={<StaffLogin />} />
          
          <Route path="staff/home" element={<StaffHome />} />
          <Route path="staff/applicant-info" element={<StaffApplicantInfo />} />
          <Route path="staff/applicant-database" element={<StaffApplicantDatabase />} />
         
          {/* Applicant routes */}
          <Route path="/applicant/login" element={<ApplicantLogin />} />
          <Route path="/applicant/home" element={<ApplicantHome />} />
          <Route
            path="/applicant/create-account"
            element={<ApplicantCreateAccount />}
          />
          <Route
            path="/applicant/register"
            element={<ApplicantRegistrationForm />}
          />
          <Route
            path="/applicant/book-appointment"
            element={<ApplicantBookAppointment />}
          />
          <Route path="/applicant/profile" element={<ApplicantProfile />} />
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
