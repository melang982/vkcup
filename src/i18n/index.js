const defaultLocale = "ru";

let locale;
let translations = {};

const fetchTranslationsFor = async (newLocale) => {
  const response = await fetch(`/${newLocale}.json`);
  return await response.json();
};

const translateElement = (element) => {
  const key = element.getAttribute("data-i18n-key");
  const translation = translations[key];
  element.innerText = translation;
};

const translatePage = () => {
  document.querySelectorAll("[data-i18n-key]").forEach(translateElement);
};

const setLocale = async (newLocale) => {
  if (newLocale === locale) return;
  const newTranslations = await fetchTranslationsFor(newLocale);
  locale = newLocale;
  const flagEl = document.getElementById("settings__flag");

  flagEl.setAttribute("src", locale === "ru" ? "/icons/ru.svg" : "/icons/usa.svg");
  flagEl.setAttribute("alt", locale === "ru" ? "Russia flag" : "USA flag");
  translations = newTranslations;
  translatePage();
};

const initI18n = () => {
  document.addEventListener("DOMContentLoaded", setLocale(defaultLocale));

  document.getElementById("language-form").onsubmit = (e) => {
    e.preventDefault();
    setLocale(e.target.elements.language.value);
  };
};

export { initI18n };
