import { addChild } from "../utils";
import "../components/InputSelect";

const tree = [{ text: "hello world" }];
const contentEl = document.getElementById("editor__content");
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

const applyStyle = (style) => {
  console.log(style);
  splitNode(location.range.anchor.path, style, true);
  contentEl.innerHTML = treeToHTML(tree);
  setCaret();
};

const initEditor = () => {
  contentEl.innerHTML = treeToHTML(tree);

  contentEl.addEventListener("input", (e) => {
    console.log("change");

    const node = getNodeByPath(location.path, tree);
    const el = getElementFromPath(location.path);

    node.text = el.textContent;
  });

  contentEl.addEventListener("click", (e) => {
    console.log("click");
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

      btn.addEventListener("click", () => {
        applyStyle(style);
      });
    }
  }
};

const getSelectionStyles = () => {
  let commonStyles = STYLES.map((s) => s.name);
  const startNode = getNodeByPath(location.range.anchor.path);
  const finishNode = getNodeByPath(location.range.focus.path);

  const nodes = getNodesBetweenPaths(startNode, finishNode);

  for (let node of nodes) {
    let nodeStyles = getNodeStyles(node);
    console.log(nodeStyles);

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

const splitNode = (path, style, isEnabled) => {
  //console.log(location);

  const startNode = getNodeByPath(location.range.anchor.path);
  const finishNode = getNodeByPath(location.range.focus.path);

  const nodesBetween = getNodesBetweenPaths(startNode, finishNode);

  for (let node of nodesBetween) {
    let strBefore = "",
      strMain = "",
      strAfter = "";

    if (node != startNode && node != finishNode) {
      if (node.style) {
        node.children = [{ text: node.text, style: style, parent: node }];
        delete node.text;
      } else node.style = style;
    } else {
      if (node == startNode) strBefore = node.text.substring(0, location.range.anchor.offset);
      if (node == finishNode) {
        strAfter = node.text.substring(location.range.focus.offset);
        strMain = node.text.substring(
          node == startNode ? location.range.anchor.offset : 0,
          location.range.focus.offset
        );
      } else strMain = node.text.substring(location.range.anchor.offset);

      if (node.style) {
        console.log("here");
        node.children = [];
        if (strBefore) node.children.push({ text: strBefore, parent: node });
        const mainNode = { text: strMain, style: style, parent: node };
        node.children.push(mainNode);
        if (strAfter) node.children.push({ text: strAfter, parent: node });

        if (node == startNode) location.range.anchor = { path: getNodePath(mainNode), offset: 0 };
        if (node == finishNode)
          location.range.focus = { path: getNodePath(mainNode), offset: mainNode.text.length };

        delete node.text;
      } else {
        node.text = strMain;
        node.style = style;

        const parentChildren = node.parent ? node.parent.children : tree;
        let index = path[path.length - 1];
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
      //console.log(location);
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
    range.setStart(elStart, location.range.anchor.offset);
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
    //console.log("window");
    sel = window.getSelection();

    if (sel.rangeCount) {
      range = sel.getRangeAt(0);

      if (contentEl.contains(range.commonAncestorContainer)) {
        location.path = getPath(sel.anchorNode);
        location.range = {
          anchor: { path: getPath(sel.anchorNode), offset: range.startOffset },
          focus: { path: getPath(sel.focusNode), offset: range.endOffset },
        };
      }
    }
  } else if (document.selection && document.selection.createRange) {
    console.log("document");
    range = document.selection.createRange();
    if (range.parentElement() == editableDiv) {
      let tempEl = document.createElement("span");
      editableDiv.insertBefore(tempEl, editableDiv.firstChild);
      let tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint("EndToEnd", range);
      caretPos = tempRange.text.length;
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
    else html += node.text;

    if (node.style) html += `</${node.style.tag}>`;
  }

  return html;
};

export { initEditor };
