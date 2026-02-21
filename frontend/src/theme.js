import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0D47A1"
    },
    secondary: {
      main: "#00ACC1"
    },
    background: {
      default: "#F4F8FB"
    }
  },
  typography: {
    fontFamily: "Segoe UI, sans-serif"
  }
});

export default theme;
