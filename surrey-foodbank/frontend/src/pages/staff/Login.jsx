import Button from "@mui/material/Button";
import EmailField from "../../components/EmailField";
import Link from "@mui/material/Link";
import PasswordField from "../../components/PasswordField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Window from "../../components/Window";

function Login() {
  return (
    <>
      <Window title="Surrey Food Bank Administrator Login">
        <EmailField />
        <PasswordField />
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
            <Typography>Not an administrator?</Typography>
          </Link>
          <Button
            variant="contained"
            href="/staff/home"
            size="large"
            sx={{
              fontWeight: "bold",
            }}
          >
            Log In
          </Button>
        </Stack>
      </Window>
    </>
  );
}

export default Login;
