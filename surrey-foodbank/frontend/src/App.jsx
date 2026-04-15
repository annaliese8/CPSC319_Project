import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/theme";
import { Routes, Route, Navigate} from "react-router-dom";
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
import ResetPassword from "./pages/ResetPassword";

const staffBase = import.meta.env.VITE_STAFF_BASE;

function StaffRoute({ children }) {
  const raw = sessionStorage.getItem("staffAuth");
  if (raw) {
    try {
      const { expiry } = JSON.parse(raw);
      if (Date.now() < expiry) return children;
    } catch { /* fall through */ }
  }
  sessionStorage.removeItem("staffAuth");
  return <Navigate to={`/${staffBase}/login`} replace />;
}

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Routes>

          <Route path="/" element={<Navigate to="/applicant/home" replace />} />

          {/* Secret staff admin */}
          <Route path={`/${staffBase}/login`} element={<StaffLogin />} />

          {/* Staff routes — protected by sessionStorage session */}
          <Route path="/staff/home" element={<StaffRoute><StaffHome /></StaffRoute>} />
          <Route path="/staff/applicant-info" element={<StaffRoute><StaffApplicantInfo /></StaffRoute>} />
          <Route path="/staff/applicant-database" element={<StaffRoute><StaffApplicantDatabase /></StaffRoute>} />
         
          {/* Applicant routes */}
          <Route path="/applicant/login" element={<ApplicantLogin />} />
          <Route path="/applicant/home" element={<ApplicantHome />} />
          <Route path="/applicant/create-account" element={<ApplicantCreateAccount />} />
          <Route path="/applicant/register" element={<ApplicantRegistrationForm />} />
          <Route path="/applicant/book-appointment" element={<ApplicantBookAppointment />} />
          <Route path="/applicant/profile" element={<ApplicantProfile />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
