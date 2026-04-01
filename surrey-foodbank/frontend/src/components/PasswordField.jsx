import InputAdornment from "@mui/material/InputAdornment";
import LockOutlineIcon from "@mui/icons-material/LockOutline";
import TextField from "@mui/material/TextField";

function PasswordField({
  id = "password",
  label = "Password",
  onChange,
  helperText = "",
  error = false,
  ...props
}) {
  return (
    <>
      <TextField
        required
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
          htmlInput: { maxLength: 254 }
        }}
        id={id}
        label={label}
        onChange={onChange}
        helperText={helperText}
        error={error}
        {...props}
      />
    </>
  );
}

export default PasswordField;
