// // Copilot was used to help create the form validation functions

// import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
// import EmailField from "../../components/EmailField";
// import Link from "@mui/material/Link";
// import PasswordField from "../../components/PasswordField";
// import Stack from "@mui/material/Stack";
// import Typography from "@mui/material/Typography";
// import Window from "../../components/Window";

// import useTextField from "../../hooks/useTextField";
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// // Account creation page for new applicants to set an email and password

// function CreateAccount() {
//   // Email must follow a basic email format and
//   // not already be associated with an existing account
//   const emailField = useTextField("", (value) => {
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
//       return "Please enter a valid email address";
//     }
//     const users = JSON.parse(localStorage.getItem("users") || "[]");
//     if (users.some((user) => user.email === value)) {
//       return "An account with this email address already exists";
//     }
//     return "";
//   });

//   // Password must be at least 10 characters long
//   const passwordField = useTextField("", (value) =>
//     value.length < 10 ? "Password must be at least 10 characters" : "",
//   );

//   // Confirm password must always match the password field
//   const confirmPasswordField = useTextField("", (value) =>
//     value !== passwordField.value ? "Passwords do not match" : "",
//   );

//   // Re-run confirm password validation whenever the main password changes
//   useEffect(() => {
//     confirmPasswordField.validate();
//   }, [passwordField.value]);

//   // When the form is submitted, revalidate the fields.
//   // If no errors exist, save account details, set as active user,
//   // and navigate to booking page
//   const navigate = useNavigate();
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const hasErrors =
//       Boolean(emailField.validate()) ||
//       Boolean(passwordField.validate()) ||
//       Boolean(confirmPasswordField.validate());

//     const hasEmptyField =
//       !emailField.value || !passwordField.value || !confirmPasswordField.value;

//     if (hasErrors || hasEmptyField) {
//       return;
//     } else {
//       const users = JSON.parse(localStorage.getItem("users") || "[]");
//       users.push({ email: emailField.value, password: passwordField.value });
//       localStorage.setItem("users", JSON.stringify(users));
//       localStorage.setItem(
//         "activeUser",
//         JSON.stringify({ email: emailField.value }),
//       );
//       navigate("/applicant/book-appointment");
//     }
//   };

//   return (
//     <Window title="Surrey Food Bank Appointment Booking">
//       <Typography align="center" sx={{ fontSize: 18, padding: 2 }}>
//         Please create an account to continue booking your appointment
//       </Typography>
//       <Box
//         component="form"
//         onSubmit={handleSubmit}
//         sx={{ display: "flex", flexDirection: "column" }}
//         noValidate
//       >
//         <EmailField
//           value={emailField.value}
//           onChange={emailField.onChange}
//           error={emailField.isInvalid}
//           helperText={emailField.errorMessage}
//         />
//         <PasswordField
//           value={passwordField.value}
//           onChange={passwordField.onChange}
//           error={passwordField.isInvalid}
//           helperText={passwordField.errorMessage}
//         />
//         <PasswordField
//           id="confirm-password"
//           label="Confirm Password"
//           value={confirmPasswordField.value}
//           onChange={confirmPasswordField.onChange}
//           error={confirmPasswordField.isInvalid}
//           helperText={confirmPasswordField.errorMessage}
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
//           <Link href="/applicant/login" underline="hover">
//             <Typography>Already have an account?</Typography>
//           </Link>
//           <Button
//             type="submit"
//             variant="contained"
//             size="large"
//             sx={{ fontWeight: "bold" }}
//           >
//             Create Account
//           </Button>
//         </Stack>
//       </Box>
//     </Window>
//   );
// }

// export default CreateAccount;
// Copilot was used to help create the form validation functions

// Copilot was used to help create the form validation functions

// Copilot was used to help create the form validation functions

// import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import EmailField from "../../components/EmailField";
// import Link from "@mui/material/Link";
// import Paper from "@mui/material/Paper";
// import PasswordField from "../../components/PasswordField";
// import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
// import Stack from "@mui/material/Stack";
// import Tooltip from "@mui/material/Tooltip";
// import Typography from "@mui/material/Typography";
// import Window from "../../components/Window";

// import useTextField from "../../hooks/useTextField";
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// // Account creation page for new applicants to set an email and password

// // Helper text shown below the email field when there is no error.
// const EMAIL_FORMAT_HINT = "e.g. yourname@example.com";

// // ---------------------------------------------------------------------------
// // Password requirement rules — single source of truth used by both the
// // checklist UI and the field validator so they are always in sync.
// // ---------------------------------------------------------------------------
// const PASSWORD_RULES = [
//   {
//     id: "length",
//     label: "At least 10 characters long",
//     test: (v) => v.length >= 10,
//   },
//   {
//     id: "uppercase",
//     label: "Contains at least one capital letter (e.g. A, B, C …)",
//     test: (v) => /[A-Z]/.test(v),
//   },
//   {
//     id: "number",
//     label: "Contains at least one number (e.g. 1, 2, 3 …)",
//     test: (v) => /[0-9]/.test(v),
//   },
// ];

// // ---------------------------------------------------------------------------
// // EmailFormatGuide
// // A visual, colour-coded diagram that breaks down the parts of an email address
// // so that users who have never seen one before can understand what to type.
// // Shown persistently above the email field so it is visible before the user
// // even clicks the input.
// // ---------------------------------------------------------------------------
// function EmailFormatGuide() {
//   const parts = [
//     {
//       text: "yourname",
//       color: "#1565c0",
//       bg: "#e3f2fd",
//       label: "Your name or username",
//       detail:
//         'This is how you identify yourself — like a nickname. It can include letters, numbers, dots, or underscores. Example: "john.doe" or "jane123"',
//     },
//     {
//       text: "@",
//       color: "#6a1b9a",
//       bg: "#f3e5f5",
//       label: 'The "at" symbol',
//       detail:
//         'This symbol (called "at") separates your name from the email service. Every email address has exactly one "@".',
//     },
//     {
//       text: "example",
//       color: "#2e7d32",
//       bg: "#e8f5e9",
//       label: "Email service name",
//       detail:
//         'This is the company or service that provides your email. Common ones are "gmail", "yahoo", or "hotmail".',
//     },
//     {
//       text: ".com",
//       color: "#e65100",
//       bg: "#fff3e0",
//       label: "Domain ending",
//       detail:
//         'This ending shows what kind of service it is. Common endings are ".com", ".ca", ".org", or ".net".',
//     },
//   ];

//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         border: "1px solid #e0e0e0",
//         borderRadius: 2,
//         p: 1.25,
//         mb: 1.5,
//         backgroundColor: "#fafafa",
//       }}
//     >
//       <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
//         {/* Label */}
//         <Typography
//           variant="caption"
//           sx={{ color: "text.secondary", fontWeight: 600, whiteSpace: "nowrap" }}
//         >
//           Email format:
//         </Typography>

//         {/* Colour-coded address — inline, smaller font */}
//         <Stack direction="row" alignItems="center" flexWrap="wrap">
//           {parts.map((part) => (
//             <Tooltip
//               key={part.text}
//               title={
//                 <Box>
//                   <Typography variant="caption" sx={{ fontWeight: 700 }}>
//                     {part.label}
//                   </Typography>
//                   <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
//                     {part.detail}
//                   </Typography>
//                 </Box>
//               }
//               arrow
//               placement="top"
//               enterTouchDelay={0}
//             >
//               <Box
//                 component="span"
//                 sx={{
//                   color: part.color,
//                   backgroundColor: part.bg,
//                   borderRadius: 0.75,
//                   px: 0.5,
//                   py: 0.1,
//                   fontFamily: "monospace",
//                   fontSize: "0.8rem",
//                   fontWeight: 700,
//                   cursor: "help",
//                   "&:hover": { opacity: 0.8 },
//                 }}
//               >
//                 {part.text}
//               </Box>
//             </Tooltip>
//           ))}
//         </Stack>

//         {/* Inline hint */}
//         <Typography variant="caption" sx={{ color: "text.disabled", whiteSpace: "nowrap" }}>
//           Hover on each part for help
//         </Typography>
//       </Stack>
//     </Paper>
//   );
// }

// // ---------------------------------------------------------------------------
// // PasswordRequirementsChecklist
// // Shown persistently above the password field — before the user types —
// // so they know all requirements upfront (addresses the bug: requirements were
// // previously only revealed after typing began).
// // Each rule turns green with a checkmark as the user satisfies it, giving
// // immediate, positive feedback rather than only surfacing errors.
// // ---------------------------------------------------------------------------
// function PasswordRequirementsChecklist({ value }) {
//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         border: "1px solid #e0e0e0",
//         borderRadius: 2,
//         p: 2,
//         mb: 2,
//         backgroundColor: "#fafafa",
//       }}
//     >
//       <Typography
//         variant="subtitle2"
//         sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}
//       >
//         Your password must have:
//       </Typography>

//       <Stack spacing={0.75}>
//         {PASSWORD_RULES.map((rule) => {
//           const passed = rule.test(value);
//           return (
//             <Stack
//               key={rule.id}
//               direction="row"
//               spacing={1}
//               alignItems="center"
//             >
//               {/* Icon swaps from hollow circle → filled green check when rule passes */}
//               {passed ? (
//                 <CheckCircleIcon
//                   fontSize="small"
//                   sx={{ color: "success.main", flexShrink: 0 }}
//                 />
//               ) : (
//                 <RadioButtonUncheckedIcon
//                   fontSize="small"
//                   sx={{ color: "text.disabled", flexShrink: 0 }}
//                 />
//               )}
//               <Typography
//                 variant="body2"
//                 sx={{
//                   // Strike-through text when rule is satisfied gives clear visual closure
//                   color: passed ? "success.main" : "text.primary",
//                   textDecoration: passed ? "line-through" : "none",
//                   transition: "color 0.2s, text-decoration 0.2s",
//                 }}
//               >
//                 {rule.label}
//               </Typography>
//             </Stack>
//           );
//         })}
//       </Stack>
//     </Paper>
//   );
// }

// // ---------------------------------------------------------------------------
// // CreateAccount
// // ---------------------------------------------------------------------------
// function CreateAccount() {
//   // Email must follow a basic email format and
//   // not already be associated with an existing account
//   const emailField = useTextField("", (value) => {
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
//       return "Please enter a valid email address in the format: yourname@example.com";
//     }
//     const users = JSON.parse(localStorage.getItem("users") || "[]");
//     if (users.some((user) => user.email === value)) {
//       return "An account with this email address already exists";
//     }
//     return "";
//   });

//   // Validate against all PASSWORD_RULES so the validator stays in sync with
//   // the checklist displayed above the field.
//   const passwordField = useTextField("", (value) => {
//     const failed = PASSWORD_RULES.filter((rule) => !rule.test(value));
//     if (failed.length === 0) return "";
//     // Return the first unmet rule as the helper-text error
//     return `Password must ${failed[0].label.toLowerCase()}`;
//   });

//   // Confirm password must always match the password field
//   const confirmPasswordField = useTextField("", (value) =>
//     value !== passwordField.value ? "Passwords do not match" : "",
//   );

//   // Re-run confirm password validation whenever the main password changes
//   useEffect(() => {
//     confirmPasswordField.validate();
//   }, [passwordField.value]);

//   // When the form is submitted, revalidate the fields.
//   // If no errors exist, save account details, set as active user,
//   // and navigate to booking page
//   const navigate = useNavigate();
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const hasErrors =
//       Boolean(emailField.validate()) ||
//       Boolean(passwordField.validate()) ||
//       Boolean(confirmPasswordField.validate());

//     const hasEmptyField =
//       !emailField.value || !passwordField.value || !confirmPasswordField.value;

//     if (hasErrors || hasEmptyField) {
//       return;
//     } else {
//       const users = JSON.parse(localStorage.getItem("users") || "[]");
//       users.push({ email: emailField.value, password: passwordField.value });
//       localStorage.setItem("users", JSON.stringify(users));
//       localStorage.setItem(
//         "activeUser",
//         JSON.stringify({ email: emailField.value }),
//       );
//       navigate("/applicant/book-appointment");
//     }
//   };

//   return (
//     <Window title="Surrey Food Bank Appointment Booking">
//       <Typography align="center" sx={{ fontSize: 18, padding: 2 }}>
//         Please create an account to continue booking your appointment
//       </Typography>
//       <Box
//         component="form"
//         onSubmit={handleSubmit}
//         sx={{ display: "flex", flexDirection: "column" }}
//         noValidate
//       >
//         {/* Email visual guide — shown above the email input */}
//         <Box sx={{ px: 2, pt: 1 }}>
//           <EmailFormatGuide />
//         </Box>

//         <EmailField
//           placeholder="yourname@example.com"
//           value={emailField.value}
//           onChange={emailField.onChange}
//           error={emailField.isInvalid}
//           helperText={
//             emailField.isInvalid ? emailField.errorMessage : EMAIL_FORMAT_HINT
//           }
//         />

//         {/* Password checklist — shown above the password input so requirements
//             are visible before the user starts typing (fixes reported bug) */}
//         <Box sx={{ px: 2, pt: 1 }}>
//           <PasswordRequirementsChecklist value={passwordField.value} />
//         </Box>

//         <PasswordField
//           value={passwordField.value}
//           onChange={passwordField.onChange}
//           error={passwordField.isInvalid}
//           helperText={passwordField.errorMessage}
//         />
//         <PasswordField
//           id="confirm-password"
//           label="Confirm Password"
//           value={confirmPasswordField.value}
//           onChange={confirmPasswordField.onChange}
//           error={confirmPasswordField.isInvalid}
//           helperText={confirmPasswordField.errorMessage}
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
//           <Link href="/applicant/login" underline="hover">
//             <Typography>Already have an account?</Typography>
//           </Link>
//           <Button
//             type="submit"
//             variant="contained"
//             size="large"
//             sx={{ fontWeight: "bold" }}
//           >
//             Create Account
//           </Button>
//         </Stack>
//       </Box>
//     </Window>
//   );
// }

// export default CreateAccount;
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Divider from "@mui/material/Divider";
import EmailField from "../../components/EmailField";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import PasswordField from "../../components/PasswordField";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import logo from "../../styles/full-logo.png";

import useTextField from "../../hooks/useTextField";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EMAIL_FORMAT_HINT = "e.g. yourname@example.com";

const PASSWORD_RULES = [
  { id: "length", label: "At least 10 characters long", test: (v) => v.length >= 10 },
  { id: "uppercase", label: "Contains at least one capital letter (e.g. A, B, C …)", test: (v) => /[A-Z]/.test(v) },
  { id: "number", label: "Contains at least one number (e.g. 1, 2, 3 …)", test: (v) => /[0-9]/.test(v) },
];

function EmailFormatGuide() {
  const parts = [
    { text: "yourname", color: "#1565c0", bg: "#e3f2fd", label: "Your name or username", detail: 'This is how you identify yourself — like a nickname. It can include letters, numbers, dots, or underscores. Example: "john.doe" or "jane123"' },
    { text: "@", color: "#6a1b9a", bg: "#f3e5f5", label: 'The "at" symbol', detail: 'This symbol (called "at") separates your name from the email service. Every email address has exactly one "@".' },
    { text: "example", color: "#2e7d32", bg: "#e8f5e9", label: "Email service name", detail: 'This is the company or service that provides your email. Common ones are "gmail", "yahoo", or "hotmail".' },
    { text: ".com", color: "#e65100", bg: "#fff3e0", label: "Domain ending", detail: 'This ending shows what kind of service it is. Common endings are ".com", ".ca", ".org", or ".net".' },
  ];
  return (
    <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 1.25, mb: 1.5, backgroundColor: "#fafafa" }}>
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, whiteSpace: "nowrap", fontSize: "0.95rem" }}>Email format:</Typography>
        <Stack direction="row" alignItems="center" flexWrap="wrap">
          {parts.map((part) => (
            <Tooltip key={part.text} title={<Box><Typography variant="caption" sx={{ fontWeight: 700 }}>{part.label}</Typography><Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>{part.detail}</Typography></Box>} arrow placement="top" enterTouchDelay={0}>
              <Box component="span" sx={{ color: part.color, backgroundColor: part.bg, borderRadius: 0.75, px: 0.5, py: 0.1, fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700, cursor: "help", "&:hover": { opacity: 0.8 } }}>{part.text}</Box>
            </Tooltip>
          ))}
        </Stack>
        <Typography variant="caption" sx={{ color: "text.disabled", whiteSpace: "nowrap" }}>Hover on each part for help</Typography>
      </Stack>
    </Paper>
  );
}

function PasswordRequirementsChecklist({ value }) {
  return (
    <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2.5, mb: 2, backgroundColor: "#fafafa" }}>
      <Typography variant="subtitle1" sx={{ mb: 1.5, color: "text.secondary", fontWeight: 600, fontSize: "1rem" }}>Your password must have:</Typography>
      <Stack spacing={1}>
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(value);
          return (
            <Stack key={rule.id} direction="row" spacing={1.5} alignItems="center">
              {passed ? <CheckCircleIcon sx={{ color: "success.main", flexShrink: 0 }} /> : <RadioButtonUncheckedIcon sx={{ color: "text.disabled", flexShrink: 0 }} />}
              <Typography variant="body1" sx={{ color: passed ? "success.main" : "text.primary", textDecoration: passed ? "line-through" : "none", transition: "color 0.2s, text-decoration 0.2s" }}>{rule.label}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}

function HomePage() {
  const listItemIconStyle = { fontSize: "2rem", fontWeight: "bold", color: "warning.main" };
  const listItemTextStyle = { primary: { fontSize: "1.2rem" }, secondary: { fontSize: "1.05rem" } };

  const emailField = useTextField("", (value) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address in the format: yourname@example.com";
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.some((user) => user.email === value)) return "An account with this email address already exists";
    return "";
  });

  const passwordField = useTextField("", (value) => {
    const failed = PASSWORD_RULES.filter((rule) => !rule.test(value));
    if (failed.length === 0) return "";
    return `Password must ${failed[0].label.toLowerCase()}`;
  });

  const confirmPasswordField = useTextField("", (value) =>
    value !== passwordField.value ? "Passwords do not match" : "",
  );

  useEffect(() => { confirmPasswordField.validate(); }, [passwordField.value]);

  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const hasErrors = Boolean(emailField.validate()) || Boolean(passwordField.validate()) || Boolean(confirmPasswordField.validate());
    const hasEmptyField = !emailField.value || !passwordField.value || !confirmPasswordField.value;
    if (hasErrors || hasEmptyField) return;
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    users.push({ email: emailField.value, password: passwordField.value });
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("activeUser", JSON.stringify({ email: emailField.value }));
    navigate("/applicant/book-appointment");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <AppBar position="sticky" color="transparent" elevation={1}>
        <Toolbar>
          <Link href="https://surreyfoodbank.org/">
            <Box component="img" src={logo} alt="Surrey Food Bank Logo" height={40} />
          </Link>
        </Toolbar>
      </AppBar>

      {/* Two-column body */}
      <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 0 }}>

        {/* ── LEFT: Overview / Steps ── */}
        <Box sx={{ px: { xs: 3, md: 6 }, py: 6, borderRight: { md: "1px solid #e0e0e0" }, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
            Welcome to the Surrey Food Bank Booking System
          </Typography>
          <Divider sx={{ borderColor: "warning.main", borderBottomWidth: 3, mb: 3, width: 750 }} />
          <Typography variant="h6" sx={{ mb: 0.5 }}>If you're a prospective client, you're in the right place.</Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>Follow the steps below to complete your registration.</Typography>
          <List disablePadding sx={{ width: "100%", maxWidth: 520 }}>
            <ListItem alignItems="flex-start" disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}><Typography sx={listItemIconStyle}>1.</Typography></ListItemIcon>
              <ListItemText primary="Create an account using the form on this page." secondary={<>Already have an account? Log in <Link href="/applicant/login" color="primary">here.</Link></>} slotProps={listItemTextStyle} />
            </ListItem>
            <ListItem alignItems="flex-start" disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}><Typography sx={listItemIconStyle}>2.</Typography></ListItemIcon>
              <ListItemText primary="Fill out a short form with your personal information." slotProps={listItemTextStyle} />
            </ListItem>
            <ListItem alignItems="flex-start" disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}><Typography sx={listItemIconStyle}>3.</Typography></ListItemIcon>
              <ListItemText primary="Pick an appointment date and time that works for you." secondary="You can cancel or reschedule your appointment at any time." slotProps={listItemTextStyle} />
            </ListItem>
            <ListItem alignItems="flex-start" disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}><Typography sx={listItemIconStyle}>4.</Typography></ListItemIcon>
              <ListItemText primary={<>Attend your scheduled appointment at our <Link href="https://maps.app.goo.gl/1H39wzvMBqmki2se6" color="primary">registration office.</Link></>} secondary="Bring proof of address and original government-issued photo ID for each household member." slotProps={listItemTextStyle} />
            </ListItem>
            <ListItem alignItems="flex-start" disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}><Typography sx={listItemIconStyle}>5.</Typography></ListItemIcon>
              <ListItemText primary="Visit us on your biweekly pick-up day to collect your food hamper!" slotProps={listItemTextStyle} />
            </ListItem>
          </List>
        </Box>

        {/* ── RIGHT: Account Creation Form ── */}
        <Box sx={{ px: { xs: 3, md: 6 }, py: 6, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#fafafa" }}>
          {/* maxWidth keeps fields at a comfortable reading width */}
          <Box sx={{ width: "100%", maxWidth: 560 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>Create an Account</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>Set up your account to start booking your appointment.</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column" }} noValidate>
              <EmailFormatGuide />
              <EmailField
                placeholder="yourname@example.com"
                value={emailField.value}
                onChange={emailField.onChange}
                error={emailField.isInvalid}
                helperText={emailField.isInvalid ? emailField.errorMessage : EMAIL_FORMAT_HINT}
              />
              <Box sx={{ mt: 2 }}>
                <PasswordRequirementsChecklist value={passwordField.value} />
              </Box>
              <PasswordField
                value={passwordField.value}
                onChange={passwordField.onChange}
                error={passwordField.isInvalid}
                helperText={passwordField.errorMessage}
              />
              <PasswordField
                id="confirm-password"
                label="Confirm Password"
                value={confirmPasswordField.value}
                onChange={confirmPasswordField.onChange}
                error={confirmPasswordField.isInvalid}
                helperText={confirmPasswordField.errorMessage}
              />
              <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", mt: 2 }}>
                <Link href="/applicant/login" underline="hover">
                  <Typography variant="body2">Already have an account?</Typography>
                </Link>
                <Button type="submit" variant="contained" size="large" sx={{ fontWeight: "bold" }}>
                  Create Account
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>

      </Box>
    </Box>
  );
}

export default HomePage;