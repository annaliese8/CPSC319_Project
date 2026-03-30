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
      main: "#E8112E", // #f24c62
    },
    greyDark: {
      main: "#8f8f8f",
    },
  },
  typography: { fontFamily: "Figtree, sans-serif" },
});

export default theme;
