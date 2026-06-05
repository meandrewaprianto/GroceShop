import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function DarkModeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {theme === "dark" ? (
                <SunIcon className="size-5 text-app-orange" />
            ) : (
                <MoonIcon className="size-5 text-zinc-600" />
            )}
        </button>
    );
}