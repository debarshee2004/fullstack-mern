const [themeMode, setThemeMode] = useState("light");

const lightTheme = () => {
  setThemeMode("light");
};

const darkTheme = () => {
  setThemeMode("dark");
};

// actual change in theme

useEffect(() => {
  document.querySelector("html").classList.remove("light", "dark");
  document.querySelector("html").classList.add(themeMode);
}, [themeMode]);
