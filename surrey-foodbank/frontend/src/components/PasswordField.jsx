import InputAdornment from "@mui/material/InputAdornment";
import LockOutlineIcon from "@mui/icons-material/LockOutline";
import TextField from "@mui/material/TextField";

function PasswordField({ id = "password", label = "Password", ...props }) {
  return (
    <>
      <TextField
        required
        id={id}
        label={label}
        variant="outlined"
        type="password"
        placeholder="*****************"
        sx={{ m: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlineIcon />
              </InputAdornment>
            ),
          },
        }}
        {...props}
      />
    </>
  );
}

export default PasswordField;
