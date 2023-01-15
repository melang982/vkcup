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
  if (textContent) el.innerText = textContent;
  if (attrs) for (let key in attrs) el.setAttribute(key, attrs[key]);
  if (props) for (let key in props) el[key] = props[key];

  parent.appendChild(el);
  return el;
};

export { addChild };
