const addChild = (parent, tag, className = null, textContent = null, attrs = null) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  if (attrs)
    for (let key in attrs) {
      el.setAttribute(key, attrs[key]);
    }

  parent.appendChild(el);
  return el;
};

const isToday = (d) => {
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

const formatDate = (ISOString) => {
  const months = [
    "янв",
    "фев",
    "мар",
    "апр",
    "мая",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ];

  const d = new Date(ISOString);
  const month = d.getMonth();
  const date = d.getDate().toString().padStart(2, "0");

  if (isToday(d)) return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return date + " " + months[month];
};

export { addChild, formatDate };
