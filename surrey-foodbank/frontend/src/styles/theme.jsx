import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#005070",
    },
    secondary: {
      main: "#4cc5dc",
    },
    warning: {
      main: "#f24c62",
    },
  },
  typography: { fontFamily: "Figtree, sans-serif" },
});

export default theme;
