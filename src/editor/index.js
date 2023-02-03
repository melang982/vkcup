import { addChild } from "../utils";
import "../components/InputContacts";
import "../components/InputSelect";

let tree = [{ text: "" }];

let contentEl = null;
let buttons = [];
let location = {};

const FONT_SIZES = [8, 10, 11, 12, 13, 14, 15, 16, 18, 24, 36, 48];
const FONTS = [
  "Arial",
  "Verdana",
  "Georgia",
  "Times New Roman",
  "Andale Mono",
  "Comic Sans MS",
].map((x) => ({
  name: x,
  style: `font-family:${x};`,
}));

const STYLES = [
  { name: "bold", tag: "strong" },
  { name: "italic", tag: "em" },
  { name: "underline", tag: "u" },
  { name: "strike", tag: "s" },
  {
    name: "fontSize",
    tag: "span",
    element: "select",
    selectProps: { value: 15, options: FONT_SIZES, showValue: true, align: "center" },
  },
  {
    name: "font",
    tag: "span",
    element: "select",
    selectProps: { icon: "font", value: FONTS[0], options: FONTS, optionStyles: true },
  },
];

const getLastChild = (element) => {
  let currentElement = element;
  while (currentElement.lastElementChild) currentElement = currentElement.lastElementChild;

  return currentElement;
};

const applyStyle = (style, enable = true) => {
  if (!location.range) {
    contentEl.focus();

    const lastChild = getLastChild(contentEl).firstChild;
    const path = getPath(lastChild);
    const offset = lastChild.textContent.length;

    location.range = {
      anchor: { path: path, offset: offset },
      focus: { path: path, offset: offset },
      path: path,
      offset: offset,
    };
  }

  if (enable) splitNode(location, style);
  else removeStyle(location, style);

  contentEl.innerHTML = treeToHTML(tree);
  setCaret();
};

const resetEditor = () => {
  tree = [{ text: "" }];
  contentEl.innerHTML = "";
};

const initEditor = () => {
  contentEl = document.getElementById("editor__content");
  contentEl.innerHTML = treeToHTML(tree);

  contentEl.addEventListener("input", (e) => {
    const node = getNodeByPath(location.path, tree);
    const el = getElementFromPath(location.path);

    node.text = el.textContent;
  });

  contentEl.addEventListener("click", (e) => {
    getCaret();
    updateButtons();
  });

  const buttonsContainer = document.getElementById("editor__toolbar");

  for (let style of STYLES) {
    if (style.element === "select")
      addChild(buttonsContainer, "input-select", null, null, null, {
        ...style.selectProps,
        onChange: (value) => {
          applyStyle({ ...style, value: value });
        },
      });
    else {
      const btn = addChild(buttonsContainer, "button");
      buttons.push(btn);
      addChild(btn, "svg-icon", null, null, {
        name: style.name,
        width: "16",
        height: "16",
      });

      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        //return setTimeout("", 300);
      });

      btn.addEventListener("click", () => applyStyle(style, !btn.classList.contains("active")));
    }
  }
};

const getSelectionStyles = () => {
  let commonStyles = STYLES.map((s) => s.name);
  const startNode = getNodeByPath(location.range.anchor.path);
  const finishNode = getNodeByPath(location.range.focus.path);

  const nodes = getNodesBetweenPaths(startNode, finishNode);

  for (let node of nodes) {
    if (node.text && !node.text.replace(/\s/g, "").length) continue;

    let nodeStyles = getNodeStyles(node);

    for (let i = commonStyles.length - 1; i >= 0; i--) {
      if (!nodeStyles.includes(commonStyles[i])) commonStyles.splice(i, 1);
    }
  }

  return commonStyles;
};

const getNodeStyles = (node) => {
  let styles = [];
  let currentNode = node;
  while (currentNode) {
    if (currentNode.style) {
      styles.push(currentNode.style.name);
    }
    currentNode = currentNode.parent;
  }
  return styles;
};

const updateButtons = () => {
  const selectionStyles = getSelectionStyles();

  STYLES.forEach((style, index) => {
    if (!style.element) {
      if (selectionStyles.includes(style.name)) buttons[index].classList.add("active");
      else buttons[index].classList.remove("active");
    }
  });
};

const getNodePath = (node) => {
  const path = [];
  while (node.parent) {
    path.unshift(node.parent.children.indexOf(node));
    node = node.parent;
  }
  path.unshift(tree.indexOf(node));
  return path;
};

const getPath = (element) => {
  const pop = element.parentNode.childNodes.length == 1 && element.parentNode.tagName != "DIV"; //tree root

  const path = [];
  while (element != contentEl) {
    path.unshift(Array.prototype.indexOf.call(element.parentNode.childNodes, element));
    element = element.parentNode;
  }

  if (pop) path.pop();
  return path;
};

const getNodesBetweenPaths = (startNode, finishNode) => {
  let nodes = [];
  let current = startNode;

  while (current) {
    nodes.push(current);
    if (current === finishNode) break;
    current = nextNode(current);
  }

  return nodes;
};

const nextNode = (node) => {
  if (node.children) return node.children[0];

  while (node.parent) {
    let index = node.parent.children.indexOf(node);
    if (index < node.parent.children.length - 1) return node.parent.children[index + 1];
    node = node.parent;
  }

  let index = tree.indexOf(node);
  if (index < tree.length - 1) return tree[index + 1];

  return null;
};

const getSplitParts = (node, startNode, endNode) => {
  let strBefore = "",
    strMain = "",
    strAfter = "";
  if (node == startNode) strBefore = node.text.substring(0, location.range.anchor.offset);
  if (node == endNode) {
    strAfter = node.text.substring(location.range.focus.offset);
    strMain = node.text.substring(
      node == startNode ? location.range.anchor.offset : 0,
      location.range.focus.offset
    );
  } else strMain = node.text.substring(location.range.anchor.offset);

  return { strBefore, strMain, strAfter };
};

const removeStyle = (location, style) => {
  //пока не сплитит, а убирает весь нод со стилем
  const startNode = getNodeByPath(location.range.anchor.path);
  const endNode = getNodeByPath(location.range.focus.path);

  const nodesBetween = getNodesBetweenPaths(startNode, endNode);
  for (let node of nodesBetween) {
    let styleNode = node; //ищем нод выше ответственный за этот стиль
    const path = getNodePath(styleNode);
    const indexToRemove = path.length - 1;

    while (!styleNode.style || styleNode.style.name != style.name) styleNode = styleNode.parent;
    let offset = 0;

    const parentChildren = styleNode.parent ? styleNode.parent.children : tree;
    let index = parentChildren.indexOf(styleNode);

    for (let i = 0; i < index; i++) {
      if (parentChildren[i].text) offset += parentChildren[i].text.length;
    }

    if (styleNode.children) {
      styleNode.children.forEach((child) => {
        parentChildren.splice(index, 0, child);
        index++;
      });
      parentChildren.splice(index, 1);
    } else delete styleNode.style;

    location.range.anchor.path.splice(indexToRemove, 1);
    location.range.anchor.offset += offset;
    if (location.range.anchor.path.length == 0) location.range.anchor.path = [0];
    location.range.focus.path.splice(indexToRemove, 1);
    location.range.focus.offset += offset;
    if (location.range.focus.path.length == 0) location.range.focus.path = [0];
    location.path.splice(indexToRemove, 1);
    location.offset = location.range.focus.offset;
    if (location.path.length == 0) location.path = [0];
  }
};

const splitNode = (location, style) => {
  const startNode = getNodeByPath(location.range.anchor.path);
  const endNode = getNodeByPath(location.range.focus.path);

  const nodesBetween = getNodesBetweenPaths(startNode, endNode);

  for (let node of nodesBetween) {
    if (node != startNode && node != endNode) {
      //посередине
      if (node.style) {
        let newNode = { style: style, parent: node };
        if (node.children) {
          newNode.children = [];
          for (let child of node.children) {
            child.parent = newNode;
            newNode.children.push(child);
          }
        } else newNode.text = node.text;

        node.children = [newNode];

        delete node.text;
      } else node.style = style;
    } else {
      let { strBefore, strMain, strAfter } = getSplitParts(node, startNode, endNode);

      if (node.style) {
        node.children = [];
        if (strBefore) node.children.push({ text: strBefore, parent: node });
        const mainNode = { text: strMain, style: style, parent: node };
        node.children.push(mainNode);
        if (strAfter) node.children.push({ text: strAfter, parent: node });

        if (node == startNode) location.range.anchor = { path: getNodePath(mainNode), offset: 0 };
        if (node == endNode)
          location.range.focus = { path: getNodePath(mainNode), offset: mainNode.text.length };

        delete node.text;
      } else {
        node.text = strMain;
        node.style = style;

        const parentChildren = node.parent ? node.parent.children : tree;
        let index = parentChildren.indexOf(node);

        if (strBefore) {
          parentChildren.splice(index, 0, { text: strBefore });
          index++;
        }
        if (strAfter) parentChildren.splice(index + 1, 0, { text: strAfter });

        const nodePath = getNodePath(node);

        location.range = {
          anchor: { path: nodePath, offset: 0 },
          focus: { path: nodePath, offset: node.text.length },
        };
      }
      location.path = location.range.focus.path;
      location.offset = location.range.focus.offset;
    }
  }
};

const setCaret = () => {
  const el = getElementFromPath(location.path);

  let range = document.createRange();
  let sel = window.getSelection();

  range.setEnd(el, location.offset);

  if (location.range) {
    const elStart = getElementFromPath(location.range.anchor.path);
    let offset = location.range.anchor.offset;
    if (elStart.parentElement.innerHTML.indexOf("\u200B") !== -1) offset++;
    range.setStart(elStart, offset);
  } else range.collapse(true);

  sel.removeAllRanges();
  sel.addRange(range);
  updateButtons();
};

const getElementFromPath = (path) => {
  let currentEl = contentEl;

  for (let i = 0; i < path.length; i++) currentEl = currentEl.childNodes.item(path[i]);
  if (currentEl.nodeType != Node.TEXT_NODE) return currentEl.firstChild;

  return currentEl;
};

const getNodeByPath = (path) => {
  let currentNode = tree;

  for (let i = 0; i < path.length; i++) {
    if (i === 0) currentNode = currentNode[path[i]];
    else currentNode = currentNode.children[path[i]];
  }

  return currentNode;
};

const getCaret = () => {
  let caretPos = 0,
    sel,
    range;
  if (window.getSelection) {
    sel = window.getSelection();

    if (sel.rangeCount) {
      range = sel.getRangeAt(0);

      if (contentEl.contains(range.commonAncestorContainer)) {
        const position = sel.anchorNode.compareDocumentPosition(sel.focusNode);
        const backward =
          (!position && sel.anchorOffset > sel.focusOffset) ||
          position === Node.DOCUMENT_POSITION_PRECEDING;

        const startNode = backward ? sel.focusNode : sel.anchorNode;
        const endNode = backward ? sel.anchorNode : sel.focusNode;

        location.path = getPath(startNode);
        location.range = {
          anchor: { path: getPath(startNode), offset: range.startOffset },
          focus: { path: getPath(endNode), offset: range.endOffset },
        };
      }
    }
  }
  return caretPos;
};

const treeToHTML = (tree) => {
  let html = "";
  for (let node of tree) {
    let attr = "";

    if (node.style) {
      if (node.style.value?.style) attr = ` style="${node.style.value.style}"`;
      else if (node.style.name === "fontSize") attr = ` style="font-size:${node.style.value}px;"`;
      html += `<${node.style.tag}${attr}>`;
    }

    if (node.children) html += treeToHTML(node.children);
    else if (node.text.length > 0) html += node.text;
    else html += "\u200B";

    if (node.style) html += `</${node.style.tag}>`;
  }

  return html;
};

export { initEditor, resetEditor };
