import { translateText, translateDeclination, translateDate, translateLetterDate } from "../i18n";

const addChild = (
  parent,
  tag,
  className = null,
  textContent = null,
  attrs = null,
  props = null
) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.innerHTML = textContent; //innerText
  if (attrs) {
    for (let key in attrs) el.setAttribute(key, attrs[key]);

    if (attrs["data-i18n-key"]) translateText(el);
    if (attrs["data-i18n-declination"]) translateDeclination(el);
    if (attrs["data-i18n-date"]) translateDate(el);
    if (attrs["data-i18n-letter-date"]) translateLetterDate(el);
  }

  if (props) for (let key in props) el[key] = props[key];

  parent.appendChild(el);
  return el;
};

export { addChild };
