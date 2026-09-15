const themeToggle = document.querySelector("#themeToggle");
const root = document.documentElement;
const themeColor = document.querySelector('meta[name="theme-color"]');

function updateThemeUI() {
  const isDark = root.dataset.theme !== "light";

  if (themeToggle) {
    themeToggle.textContent = isDark
      ? "[DARK] / LIGHT"
      : "DARK / [LIGHT]";

    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  if (themeColor) {
    themeColor.setAttribute("content", isDark ? "#090909" : "#ffffff");
  }
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme =
      root.dataset.theme === "light" ? "dark" : "light";

    root.dataset.theme = nextTheme;

    try {
      localStorage.setItem("chrysalis-theme", nextTheme);
    } catch (error) {}

    updateThemeUI();
  });
}

updateThemeUI();
