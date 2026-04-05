import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {}

declare module "@mui/material/Typography" {}

export const theme = createTheme({
  cssVariables: true,
});
