import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Locale, TranslationKey } from "../i18n/translations";
import { translations } from "../i18n/translations";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const STORAGE_KEY = "cmclass_locale";

const normalizeLocale = (value: string | null): Locale => {
  if (!value) return "fr";
  const normalized = value.toLowerCase();
  if (normalized.startsWith("en")) return "en";
  return "fr";
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const stored = normalizeLocale(localStorage.getItem(STORAGE_KEY));
    const browser = normalizeLocale(navigator.language);
    setLocaleState(stored || browser);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
  };

  const t = useMemo(() => {
    return (key: TranslationKey) => translations[locale][key] || translations.fr[key];
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
};
