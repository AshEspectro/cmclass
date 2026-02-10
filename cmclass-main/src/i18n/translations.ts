export type Locale = "fr" | "en";

export const translations = {
  fr: {
    footerSiteMap: "Plan du Site",
    footerLegal: "Mentions légales",
    footerAccessibility: "Accessibilité",
    footerCookies: "Cookies",
    languageFrench: "Français",
    languageEnglish: "English",
  },
  en: {
    footerSiteMap: "Site Map",
    footerLegal: "Legal Notice",
    footerAccessibility: "Accessibility",
    footerCookies: "Cookies",
    languageFrench: "French",
    languageEnglish: "English",
  },
} as const;

export type TranslationKey = keyof typeof translations.fr;
