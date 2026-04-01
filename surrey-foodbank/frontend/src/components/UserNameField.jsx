import InputAdornment from "@mui/material/InputAdornment";
import UserIcon from '@mui/icons-material/AccountCircle';
import TextField from "@mui/material/TextField";

function UserNameField(props) {
  return (
    <>
      <TextField
        required
        id="username"
        label="Username"
        variant="outlined"
        color="primary"
        placeholder="username"
        sx={{ m: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <UserIcon />
              </InputAdornment>
            ),
          },
          htmlInput: { maxLength: 254 }
        }}
        {...props}
      />
    </>
  );
}

export default UserNameField;
