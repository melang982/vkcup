const defaultLocale = "ru";

let locale;
let translations = {};

const fetchTranslationsFor = async (newLocale) => {
  const response = await fetch(`/${newLocale}.json`);
  return await response.json();
};

const translateElement = (element) => {
  const key = element.getAttribute("data-i18n-key");
  element.innerText = translations[key];
};

const translateDate = (element) => {
  const ISOString = element.getAttribute("data-i18n-date");
  element.innerText = formatDate(ISOString);
};

const translatePage = () => {
  document.querySelectorAll("[data-i18n-key]").forEach(translateElement);
  document.querySelectorAll("[data-i18n-date]").forEach(translateDate);
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

const formatDate = (ISOString) => {
  const d = new Date(ISOString);

  const today = new Date();

  if (d.toDateString() === today.toDateString())
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  if (d.getFullYear() === today.getFullYear())
    return locale === "ru"
      ? `${d.getDate().toString().padStart(2, "0")}  ${translations["months"][d.getMonth()]}`
      : d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

  return d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-EN", { dateStyle: "short" });
};

const letterDate = (ISOString) => {
  //Сегодня, 12:20 или 10 декабря, 12:20
  const d = new Date(ISOString);
  const today = new Date();
  const dateStr =
    d.toDateString() === today.toDateString()
      ? "Сегодня"
      : d.toLocaleDateString("ru-RU", {
          month: "long",
          day: "2-digit",
        });

  return `${dateStr}, ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
};

const getDeclination = (number, key) => {
  const words = translations[key];
  return (
    number +
    " " +
    words[
      number % 100 > 4 && number % 100 < 20
        ? 2
        : [2, 0, 1, 1, 1, 2][number % 10 < 5 ? Math.abs(number) % 10 : 5]
    ]
  );
};

export { initI18n, formatDate, letterDate, getDeclination };
