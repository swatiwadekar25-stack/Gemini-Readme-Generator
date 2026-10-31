const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function applyTheme(theme) {
    const isLight = theme === "light";

    document.body.classList.toggle("light-mode", isLight);

    if (themeIcon) {
        themeIcon.textContent = isLight ? "☾" : "☀";
    }

    if (themeToggle) {
        themeToggle.setAttribute(
            "aria-label",
            isLight ? "Switch to dark mode" : "Switch to light mode"
        );

        themeToggle.setAttribute("aria-pressed", String(isLight));
    }
}

let savedTheme = "dark";

try {
    savedTheme = localStorage.getItem("readmeai-theme") || "dark";
} catch (error) {
    console.warn("Unable to read saved theme:", error);
}

if (savedTheme !== "light" && savedTheme !== "dark") {
    savedTheme = "dark";
}

applyTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const newTheme = document.body.classList.contains("light-mode")
            ? "dark"
            : "light";

        applyTheme(newTheme);

        try {
            localStorage.setItem("readmeai-theme", newTheme);
        } catch (error) {
            console.warn("Unable to save theme:", error);
        }
    });
}
