import { createContext, useContext } from "react";

export const ThemeContext = createContext({
  // You can give a variable and a method in a Context.
  themeMode: "light",
  darkTheme: () => {},
  lightTheme: () => {},
});

export const ThemeProvider = ThemeContext.Provider;

export default function useTheme() {
  return useContext(ThemeContext);
}
