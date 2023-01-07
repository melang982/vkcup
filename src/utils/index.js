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

export { addChild };
