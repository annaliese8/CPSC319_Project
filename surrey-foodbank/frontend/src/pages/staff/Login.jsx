// import Button from "@mui/material/Button";
// import UserNameField from "../../components/UserNameField";
// import Link from "@mui/material/Link";
// import PasswordField from "../../components/PasswordField";
// import Stack from "@mui/material/Stack";
// import Typography from "@mui/material/Typography";
// import Window from "../../components/Window";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const ADMIN_PASSWORD = import.meta.env.VITE_STAFF_PASS;
// const ADMIN_USERNAME = import.meta.env.VITE_STAFF_USER;

// function Login() {
//   const [password, setPassword] = useState("");
//   const [username, setUsername] = useState("");
//   const [error, setError] = useState(false);
//   const navigate = useNavigate();

//   const handleLogin = () => {
//     if (password === ADMIN_PASSWORD && username === ADMIN_USERNAME) {
//       setError(false);
//       navigate("/staff/home");
//     } else {
//       setError(true);
//     }
//   };

//   return (
//     <>
//       <title>Staff Login Page | Surrey Food Bank</title>
//       <Window title="Surrey Food Bank Administrator Login">
//         <UserNameField
//           onChange={(e) => setUsername(e.target.value)}
//           error={error}
//           helperText={error ? "Incorrect username or password. Please try again." : ""}
//         />
//         <PasswordField
//           onChange={(e) => setPassword(e.target.value)}
//           error={error}
//           helperText={error ? "Incorrect username or password. Please try again." : ""}
//         />
//         <Stack
//           direction="row"
//           spacing={2}
//           sx={{
//             display: "flex",
//             alignItems: "flex-end",
//             justifyContent: "space-between",
//             padding: 2,
//           }}
//         >
//           <Link
//             component="button"
//             type="button"
//             underline="hover"
//             onClick={() => navigate("/applicant/login")}
//           >
//             <Typography>Not an administrator?</Typography>
//           </Link>
//           <Button
//             variant="contained"
//             onClick={handleLogin}
//             size="large"
//             sx={{ fontWeight: "bold" }}
//           >
//             Log In
//           </Button>
//         </Stack>
//       </Window>
//     </>
//   );
// }

// export default Login;

import Button from "@mui/material/Button";
import UserNameField from "../../components/UserNameField";
import Link from "@mui/material/Link";
import PasswordField from "../../components/PasswordField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Window from "../../components/Window";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_PASSWORD = import.meta.env.VITE_STAFF_PASS;
const ADMIN_USERNAME = import.meta.env.VITE_STAFF_USER;
const STAFF_BASE = import.meta.env.VITE_STAFF_BASE || "staff";

function Login() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (
      password.trim() === ADMIN_PASSWORD?.trim() &&
      username.trim() === ADMIN_USERNAME?.trim()
    ) {
      setError(false);
      // Store a session flag so protected routes can verify login
      localStorage.setItem("staffAuth", "true");
      navigate("/staff/home");
    } else {
      setError(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <title>Staff Login Page | Surrey Food Bank</title>
      <Window title="Surrey Food Bank Administrator Login">
        <UserNameField
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          error={error}
          helperText={
            error ? "Incorrect username or password. Please try again." : ""
          }
        />
        <PasswordField
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          error={error}
          helperText={
            error ? "Incorrect username or password. Please try again." : ""
          }
        />
        <Stack
          direction="row"
          spacing={2}
          sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: 2,
          }}
        >
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={() => navigate("/applicant/login")}
          >
            <Typography>Not an administrator?</Typography>
          </Link>
          <Button
            variant="contained"
            onClick={handleLogin}
            size="large"
            sx={{ fontWeight: "bold" }}
          >
            Log In
          </Button>
        </Stack>
      </Window>
    </>
  );
}

export default Login;