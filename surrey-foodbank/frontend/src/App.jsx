import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/theme";

import { Routes, Route } from "react-router-dom";
import StaffLogin from "./pages/staff/Login";
import StaffHome from "./pages/staff/Home";
import EditSlot from "./pages/staff/EditSlot";
import StaffApplicantInfo from "./pages/staff/ApplicantInfo";


import ApplicantLogin from "./pages/applicant/Login";
import ApplicantHome from "./pages/applicant/Home";
import ApplicantCreateAccount from "./pages/applicant/CreateAccount";
import ApplicantBookAppointment from "./pages/applicant/BookAppointment";
import ApplicantProfile from "./pages/applicant/Profile";

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Routes>
          {/* Staff routes */}
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/staff/home" element={<StaffHome />} />
          <Route path="/staff/edit" element={<EditSlot />} />
          <Route
            path="/staff/applicant-info"
            element={<StaffApplicantInfo />}
          />

          {/* Applicant routes */}
          <Route path="/applicant/login" element={<ApplicantLogin />} />
          <Route path="/applicant/home" element={<ApplicantHome />} />
          <Route
            path="/applicant/create-account"
            element={<ApplicantCreateAccount />}
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
