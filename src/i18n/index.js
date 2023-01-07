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
  translations = newTranslations;
  translatePage();
};

const initI18n = () => {
  document.addEventListener("DOMContentLoaded", setLocale(defaultLocale));
};

export { initI18n, translateElement };
