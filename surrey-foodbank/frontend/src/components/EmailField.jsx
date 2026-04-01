import InputAdornment from "@mui/material/InputAdornment";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import TextField from "@mui/material/TextField";

function EmailField({ onChange, error = false, helperText = "", ...props }) {
  return (
    <>
      <TextField
        required
        id="email"
        label="Email"
        variant="outlined"
        color="primary"
        placeholder="email@address.com"
        sx={{ m: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <MailOutlineIcon />
              </InputAdornment>
            ),
          },
          htmlInput: { maxLength: 254 }
        }}
        onChange={onChange}
        helperText={helperText}
        error={error}
        {...props}
      />
    </>
  );
}

export default EmailField;
