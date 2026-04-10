import { createTheme } from "@mui/material/styles";
import { componentOverrides } from "./overrides";
import { accent, aubergine, feedback, line, textColors } from "./palette";
import { gradients, motion, noise, radii } from "./tokens";
import { typography } from "./typography";

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: { main: accent.sunset, contrastText: textColors.primary },
    secondary: { main: accent.violet, contrastText: textColors.primary },
    warning: { main: feedback.warning },
    error: { main: feedback.error },
    success: { main: feedback.success },
    info: { main: feedback.info },
    background: { default: aubergine.base, paper: aubergine.surface },
    text: {
      primary: textColors.primary,
      secondary: textColors.secondary,
      disabled: textColors.disabled,
    },
    divider: line.divider,
    aubergine,
    accent,
    line,
  },
  shape: { borderRadius: radii.md },
  typography,
  gradients,
  motion,
  noise,
  radii,
  components: componentOverrides,
});
