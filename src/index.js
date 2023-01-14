import "./styles/index.css";
import "./styles/settings.css";
import "./styles/themes.css";
import "./styles/filter.css";
import { initRouter, navigateTo } from "./router";
import { initI18n, translateElement } from "./i18n";
import { addChild } from "./utils";
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
const themeColorsDark = [
  "#4A352F",
  "#424242",
  "#5A355A",
  "#35385A",
  "#646ECB",
  "#E73672",
  "#F44336",
  "#388E3C",
];

const themeColorsLight = [
  "#81D8D0",
  "#E2DCD2",
  "#FFEBCD",
  "#E7EED2",
  "#D0F0F7",
  "#C9D0FB",
  "#DDF3FF",
  "#F0F0F0",
];

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

//Фильтр - попап:
let isFilterOpen = false;
const filterPopup = document.getElementById("filter__popup");

const toggleFilterPopup = () => {
  isFilterOpen = !isFilterOpen;
  filterPopup.style.display = isFilterOpen ? "block" : "none";
};

document.getElementById("btn-filter").addEventListener("click", (e) => {
  toggleFilterPopup();
  e.stopPropagation();
});

filterPopup.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Закрываем все попапы:
document.addEventListener("click", () => {
  if (isFilterOpen) toggleFilterPopup();
  if (isSettingsOpen) toggleDrawer(false);
  document.getElementById("attach__popup").style.display = "none";
  document.querySelectorAll("letter-item").forEach((btn) => btn.classList.remove("active"));
  document.querySelectorAll(".btn-attach").forEach((btn) => btn.classList.remove("active"));
});

// Фильтр - чекбоксы:
const filterOptions = {
  unread: '<span class="unread-dot"></span>',
  flagged: '<svg-icon name="bookmark"></svg-icon>',
  "with-attachments": '<svg-icon name="attach" width="24" height="24"></svg-icon>',
};

const filterForm = document.getElementById("filter__form");
const filters = [];
for (let filterOption in filterOptions) {
  const label = addChild(filterForm, "label", null, null, { for: filterOption });
  label.innerHTML += `<input type="checkbox" id="${filterOption}" name="filter" value="${filterOption}">${filterOptions[filterOption]}<span data-i18n-key="${filterOption}"></span>`;
  filters.push(document.getElementById(filterOption));
}

const filterCheckboxes = document.querySelectorAll("input[name='filter']");

const addFiltersToUrl = () => {
  const url = new URL(window.location);

  filterCheckboxes.forEach((checkbox) => {
    if (checkbox.value !== "all") {
      const paramName = `filter_${checkbox.value.replace("-", "_")}`;
      if (checkbox.checked) url.searchParams.set(paramName, "1");
      else url.searchParams.delete(paramName);
    }
  });

  navigateTo(url);
};

const resetBtn = document.getElementById("btn-reset-filter");

const updateFilterLabel = () => {
  //обновляем текст и иконку в кнопке фильтра:
  const currentFilter = document.getElementById("filter__current");
  const currentIcons = document.getElementById("filter__icons");

  const checked = filters.filter((checkbox) => checkbox.checked);
  if (checked.length == 0) {
    currentFilter.setAttribute("data-i18n-key", "filter");
    currentIcons.innerHTML = "";
    resetBtn.style.display = "none";
  } else {
    currentFilter.setAttribute("data-i18n-key", checked.length == 1 ? checked[0].id : "filters");

    resetBtn.style.display = "block";
    currentIcons.innerHTML = checked.map((x) => filterOptions[x.id]).join("");
  }
  translateElement(currentFilter);
};

resetBtn.addEventListener("click", (e) => {
  filterCheckboxes.forEach((el) => {
    if (el.value == "all") el.checked = true;
    else el.checked = false;
  });
  updateFilterLabel();
  addFiltersToUrl();
});

filterCheckboxes.forEach((el) => {
  el.addEventListener("click", (e) => {
    if (e.target.value === "all" && !e.target.checked) e.preventDefault(); //запрещаем убирать галку со "Все"
  });

  el.addEventListener("change", (e) => {
    const elements = e.target.form.elements;

    if (e.target.value === "all") filters.forEach((checkbox) => (checkbox.checked = false));
    else if (e.target.checked) {
      elements.all.checked = false;
    } else if (!filters.find((checkbox) => checkbox.checked)) {
      elements.all.checked = true;
    }

    updateFilterLabel();
    addFiltersToUrl();
  });
});
