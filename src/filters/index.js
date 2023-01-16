import { navigateTo } from "../router";
import { translateElement } from "../i18n";
import { addChild } from "../utils";

const filterOptions = {
  unread: '<span class="unread-dot"></span>',
  flagged: '<svg-icon name="bookmark"></svg-icon>',
  "with-attachments": '<svg-icon name="attach" width="24" height="24"></svg-icon>',
};

let resetBtn, filterCheckboxes;
const filters = [];
const checkboxAll = document.getElementById("all");

const filterPopup = document.getElementById("filter__popup");
let isFilterOpen = false;

const closeFilterPopup = () => {
  isFilterOpen = false;
  filterPopup.style.display = "none";
};

const initFilters = () => {
  const filterForm = document.getElementById("filter__form");

  for (let filterOption in filterOptions) {
    const label = addChild(filterForm, "label", null, null, { for: filterOption });
    label.innerHTML += `<input type="checkbox" id="${filterOption}" name="filter" value="${filterOption}">
    <svg-icon name="done" width="16" height="16"></svg-icon>
    ${filterOptions[filterOption]}
    <span data-i18n-key="${filterOption}"></span>`;
    filters.push(document.getElementById(filterOption));
  }

  resetBtn = document.getElementById("btn-reset-filter");
  filterCheckboxes = document.querySelectorAll("input[name='filter']");

  resetBtn.addEventListener("click", () => addFiltersToUrl([]));

  checkboxAll.addEventListener("click", (e) => {
    if (!e.target.checked) e.preventDefault(); //запрещаем убирать галку со "Все"
  });

  filterCheckboxes.forEach((el) => {
    el.addEventListener("change", (e) => {
      if (e.target.value === "all") addFiltersToUrl([]);
      else addFiltersToUrl(filters.filter((x) => x.checked).map((x) => x.id));
    });
  });

  //Фильтр - попап:

  const toggleFilterPopup = () => {
    isFilterOpen = !isFilterOpen;
    filterPopup.style.display = isFilterOpen ? "block" : "none";
  };

  document.getElementById("btn-filter").addEventListener("click", (e) => {
    toggleFilterPopup();
    e.stopPropagation();
  });

  filterPopup.addEventListener("click", (e) => e.stopPropagation());

  // Закрываем попап при клике вне его:
  document.addEventListener("click", () => closeFilterPopup());
};

const filterOnRouteChange = () => {
  //при смене урла
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  let found = false;

  document.querySelectorAll("input[name='filter']").forEach((el) => {
    if (params.get(`filter_${el.value.replace("-", "_")}`)) {
      el.checked = true;
      found = true;
    } else el.checked = false;
  });
  if (found) document.getElementById("btn-reset-filter").style.display = "block";
  else document.querySelector("input[value='all']").checked = true;

  updateFilterLabel();
};

const addFiltersToUrl = (newFilters) => {
  const url = new URL(window.location);

  for (const key of [...url.searchParams.keys()]) url.searchParams.delete(key);

  for (let key of newFilters) url.searchParams.set(`filter_${key.replace("-", "_")}`, "1");

  navigateTo(url);
};

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

export { initFilters, filterOnRouteChange, closeFilterPopup };
