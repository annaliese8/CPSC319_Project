import Button from "@mui/material/Button";
import EmailField from "../../components/EmailField";
import Link from "@mui/material/Link";
import PasswordField from "../../components/PasswordField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Window from "../../components/Window";

function CreateAccount() {
  return (
    <>
      <Window title="Surrey Food Bank Appointment Booking">
        <Typography align="center" sx={{ fontSize: 18, padding: 2 }}>
          Please create an account to continue booking your appointment
        </Typography>
        <EmailField />
        <PasswordField />
        <PasswordField id="confirm-password" label="Confirm Password" />
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
          <Link href="/applicant/login" underline="hover">
            <Typography>Already have an account?</Typography>
          </Link>
          <Button
            variant="contained"
            href="/applicant/home"
            size="large"
            sx={{
              fontWeight: "bold",
            }}
          >
            Create Account
          </Button>
        </Stack>
      </Window>
    </>
  );
}

export default CreateAccount;
