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
      main: "#f24c62", // #E8112E
    },
    greyDark: {
      main: "#8f8f8f",
    },
  },
  typography: { fontFamily: "Figtree, sans-serif" },
});

export default theme;
