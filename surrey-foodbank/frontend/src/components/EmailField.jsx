import InputAdornment from "@mui/material/InputAdornment";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import TextField from "@mui/material/TextField";

function EmailField(props) {
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
        }}
        {...props}
      />
    </>
  );
}

export default EmailField;
