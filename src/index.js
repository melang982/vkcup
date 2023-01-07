import "./styles/index.css";
import "./styles/settings.css";
import initRouter from "./router";
import { initI18n } from "./i18n";
import "./components/SvgIcon";

initRouter();
initI18n();

//Navigation folders:
const folders = ["inbox", "important", "sent", "drafts", "archive", "spam", "trash"];
const wrapper = document.getElementById("folders");

let foldersHtml = "";
for (let folder of folders) {
  foldersHtml += `<a class="folder nav-btn" data-link="" href="/${folder}"><svg width="20" height="20" viewBox="0 0 20 20">
  <use href="/icons/${folder}.svg#id"></use>
</svg><span data-i18n-key="${folder}"></span></a>`;
}
wrapper.innerHTML = foldersHtml;

//Settings popup:
let isSettingsOpen = false;

const togglePopup = (newValue) => {
  isSettingsOpen = newValue;
  document.getElementById("wrap").style = isSettingsOpen
    ? `transition: transform 0.1s ease 0s; transform: scale(0.8);`
    : `transition: transform 0.1s ease 0s;`;

  document.getElementById("settings__popup").style.display = isSettingsOpen ? `flex` : `none`;
};

const toggleTab = (isThemeTab) => {
  document.getElementById("settings__theme").style.display = isThemeTab ? "block" : "none";
  document.getElementById("settings__language").style.display = isThemeTab ? "none" : "block";
};

document.getElementById("btn-settings").addEventListener("click", (e) => {
  togglePopup(true);
  e.stopPropagation();
});

document.getElementById("settings__btn-theme").addEventListener("click", () => toggleTab(true));
document.getElementById("settings__btn-language").addEventListener("click", () => toggleTab(false));

document.getElementById("settings__popup").addEventListener("click", (e) => {
  e.stopPropagation();
});
document.addEventListener("click", () => {
  if (isSettingsOpen) togglePopup(false);
});
