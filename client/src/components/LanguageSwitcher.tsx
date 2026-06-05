import { useTranslation } from "react-i18next";
import { LanguagesIcon } from "lucide-react";
import { useState } from "react";

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);

    const switchLang = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("app_lang", lang);
        setOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-xl hover:bg-app-cream transition-colors"
                title="Change Language"
            >
                <LanguagesIcon className="size-5 text-zinc-600" />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-app-border py-1 z-50 animate-fade-in">
                        <button
                            onClick={() => switchLang("id")}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${i18n.language === "id" ? "bg-app-green/10 text-app-green font-semibold" : "text-zinc-700 hover:bg-app-cream"}`}
                        >
                            🇮🇩 Indonesia
                        </button>
                        <button
                            onClick={() => switchLang("en")}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${i18n.language === "en" ? "bg-app-green/10 text-app-green font-semibold" : "text-zinc-700 hover:bg-app-cream"}`}
                        >
                            🇬🇧 English
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}