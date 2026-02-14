import './App.css'
import { Routes, Route} from 'react-router-dom';
 
import StaffLogin from "./pages/staff/Login";
import StaffHome from "./pages/staff/Home";
import StaffApplicantInfo from "./pages/staff/ApplicantInfo";

import ApplicantLogin from "./pages/applicant/Login";
import ApplicantHome from "./pages/applicant/Home";
import ApplicantCreateAccount from "./pages/applicant/CreateAccount";
import ApplicantBookAppointment from "./pages/applicant/BookAppointment";
import ApplicantProfile from "./pages/applicant/Profile";

function App() {

  return (
    <>
      <h1>Surrey Food Bank Food Bank Appointment & Registration System</h1>

      <Routes>
        {/* Staff routes */}
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff/home" element={<StaffHome />} />
        <Route path="/staff/applicant-info" element={<StaffApplicantInfo />} />

        {/* Applicant routes */}
        <Route path="/applicant/login" element={<ApplicantLogin />} />
        <Route path="/applicant/home" element={<ApplicantHome />} />
        <Route path="/applicant/create-account" element={<ApplicantCreateAccount />} />
        <Route path="/applicant/book-appointment" element={<ApplicantBookAppointment />} />
        <Route path="/applicant/profile" element={<ApplicantProfile />} />
      </Routes>
    </>
  )
}

export default App
