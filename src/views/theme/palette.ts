export const lightPalette = {
  background: "#F5F6FB", // cinza-azulado bem claro
  surface: "#FFFFFF",
  surfaceAlt: "#EEF1FF", // azul bem claro (tints/ícones)
  primary: "#4C63F0", // royal blue
  primaryDark: "#3A4FD1",
  primaryLight: "#8FA0FF",
  text: "#12131A",
  textSecondary: "#8A8FA3",
  border: "#EDEEF5",
  income: "#16A34A",
  expense: "#EF4444",
  warning: "#F59E0B",
  card: "#FFFFFF",
  tabBarInactive: "#A6ABBD",
};

export const darkPalette = {
  background: "#0E0F1A", // azul-marinho bem escuro
  surface: "#171927",
  surfaceAlt: "#1F2236",
  primary: "#6B7EFF",
  primaryDark: "#4C63F0",
  primaryLight: "#8FA0FF",
  text: "#F2F3FA",
  textSecondary: "#8F94AC",
  border: "#262A40",
  income: "#4ADE80",
  expense: "#F87171",
  warning: "#FBBF24",
  card: "#171927",
  tabBarInactive: "#585E7A",
};

export type AppPalette = typeof lightPalette;
