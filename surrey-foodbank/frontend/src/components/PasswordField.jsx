import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import LockOutlineIcon from "@mui/icons-material/LockOutline";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import TextField from "@mui/material/TextField";
import { useState } from "react";

function PasswordField({
  id = "password",
  label = "Password",
  onChange,
  helperText = "",
  error = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <TextField
        required
        variant="outlined"
        type={showPassword ? "text" : "password"}
        placeholder="*****************"
        sx={{
          m: 2,
          "& input::-ms-reveal": {
            display: "none",
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlineIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  onMouseDown={(event) => event.preventDefault()}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
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
