import "./styles/index.css";
import "./styles/settings.css";
import "./styles/themes.css";
import "./styles/filter.css";
import { initRouter } from "./router";
import { initI18n } from "./i18n";
import { initFilters } from "./filters";
import { addChild } from "./utils";
import { folders, themeColorsLight, themeColorsDark } from "./constants";
import "./components/SvgIcon";

initRouter();
initI18n();
initFilters();

//Navigation folders:

const wrapper = document.getElementById("folders");

let foldersHtml = "";
for (let folder of folders) {
  foldersHtml += `<a class="folder nav-btn" data-link="" href="/${folder}"><svg width="20" height="20" viewBox="0 0 20 20">
  <use href="/icons/${folder}.svg#id"></use>
</svg><span data-i18n-key="${folder}"></span></a>`;
}
wrapper.innerHTML = foldersHtml;

//Настройки:
let isSettingsOpen = false;

const settingsDrawer = document.getElementById("settings__drawer");
const themeButton = document.getElementById("settings__btn-theme");
const languageButton = document.getElementById("settings__btn-language");

const toggleDrawer = (newValue) => {
  isSettingsOpen = newValue;
  document.getElementById("wrap").style = isSettingsOpen
    ? `transition: transform 0.1s ease 0s; transform: scale(0.8);`
    : `transition: transform 0.1s ease 0s;`;

  if (isSettingsOpen) settingsDrawer.classList.add("open");
  else settingsDrawer.classList.remove("open");
};

document.getElementById("btn-settings").addEventListener("click", (e) => {
  toggleDrawer(true);
  e.stopPropagation();
});

const toggleTab = (isThemeTab) => {
  document.getElementById("settings__theme").style.display = isThemeTab ? "block" : "none";
  document.getElementById("settings__language").style.display = isThemeTab ? "none" : "block";
  if (isThemeTab) {
    themeButton.classList.add("active");
    languageButton.classList.remove("active");
  } else {
    languageButton.classList.add("active");
    themeButton.classList.remove("active");
  }
};

themeButton.addEventListener("click", () => toggleTab(true));
languageButton.addEventListener("click", () => toggleTab(false));

settingsDrawer.addEventListener("click", (e) => {
  e.stopPropagation();
});

//Темы:
const setTheme = (newTheme) => {
  document.body.className = "";
  document.body.style.background = null;
  document.getElementById("theme").className = "";
  document.getElementById("header").style.background = null;

  switch (newTheme) {
    case "dark":
      document.body.className = "dark";
      break;
    case "default":
      break;
    case "anime":
      document.body.className = "anime";
      document.getElementById("theme").className = "color-theme-dark";
      break;
    default:
      const isDark = themeColorsDark.includes(newTheme);
      document.getElementById("theme").className =
        "color-theme" + (isDark ? " color-theme-dark" : "");
      document.body.style.background = newTheme;
      document.getElementById("header").style.background = newTheme;
  }
};

const colorsGrid = document.getElementById("themes__colors");
themeColorsDark.concat(themeColorsLight).forEach((color) =>
  addChild(colorsGrid, "input", null, null, {
    type: "radio",
    name: "theme",
    value: color,
    style: `background: ${color}`,
  })
);

document
  .querySelectorAll("input[name='theme']")
  .forEach((el) => el.addEventListener("change", () => setTheme(el.value)));

// Закрываем попапы:
document.addEventListener("click", () => {
  if (isSettingsOpen) toggleDrawer(false);
  document.getElementById("attach__popup").style.display = "none";
  document.querySelectorAll("letter-item").forEach((btn) => btn.classList.remove("active"));
  document.querySelectorAll(".btn-attach").forEach((btn) => btn.classList.remove("active"));
});
