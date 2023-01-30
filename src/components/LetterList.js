import "./LetterItem.js";
import { getLetters } from "../api/api.js";
import { addChild } from "../utils";

const ROW_HEIGHT = 48;
const LIST_PADDING_TOP = 68; //расстояние от верха страницы до списка

class LetterList extends HTMLElement {
  constructor() {
    super();
    this.nextCursor = 0;
    this.gettingCursor = null;
  }

  connectedCallback() {
    const inner = addChild(this, "div", null, null);
    const offset = addChild(inner, "div", null, null);

    const folderSlug = this.getAttribute("folderSlug");
    let letters = [];
    let children = [];

    const virtualScroll = () => {
      const outerHeight = window.innerHeight - LIST_PADDING_TOP;
      const innerHeight = letters.length * ROW_HEIGHT;

      let startNode = Math.floor(this.scrollTop / ROW_HEIGHT);
      startNode = Math.max(0, startNode);

      let visibleNodesCount = Math.ceil((window.innerHeight - LIST_PADDING_TOP) / ROW_HEIGHT);
      visibleNodesCount = Math.min(letters.length - startNode, visibleNodesCount);

      const offsetY = startNode * ROW_HEIGHT;

      this.setAttribute("style", `height: ${outerHeight}px`);
      inner.setAttribute("style", `height: ${innerHeight}px;`);
      offset.setAttribute("style", `transform: translateY(${offsetY}px);`);

      const visibleItems = letters.slice(startNode, startNode + visibleNodesCount);

      const newIds = visibleItems.map((x) => x.id);

      for (let i = children.length - 1; i >= 0; i--) {
        let child = children[i];
        if (!newIds.includes(child.item.id)) {
          //удаляем элемент
          offset.removeChild(child);
          children.splice(i, 1);
        }
      }

      const oldIds = children.map((x) => x.item.id);
      const toAdd = [];
      for (const item of visibleItems) if (!oldIds.includes(item.id)) toAdd.push(item);

      if (toAdd.length > 0) {
        let merged = [];
        let i = 0,
          j = 0;

        while (i < children.length && j < toAdd.length) {
          if (new Date(children[i].item.date) > new Date(toAdd[j].date)) merged.push(children[i++]);
          else {
            //добавляем элемент
            const child = document.createElement("letter-item");
            child.item = toAdd[j++];
            child.folderSlug = folderSlug;
            offset.insertBefore(child, children[i]);
            merged.push(child);
          }
        }

        while (i < children.length) merged.push(children[i++]);

        while (j < toAdd.length) {
          //добавляем элемент
          const child = document.createElement("letter-item");
          child.item = toAdd[j++];
          child.folderSlug = folderSlug;
          offset.appendChild(child);
          merged.push(child);
        }

        children = [...merged];
      }

      if (
        this.scrollHeight - outerHeight - this.scrollTop <= 10 &&
        this.nextCursor &&
        this.gettingCursor != this.nextCursor
      ) {
        this.gettingCursor = this.nextCursor;
        getLetters(folderSlug, this.nextCursor).then(addItems);
      }
    };

    this.addEventListener("scroll", virtualScroll);

    const addItems = (jsonData) => {
      if (jsonData.data.length == 0) {
        const notFound = addChild(this, "div", "not-found");
        addChild(notFound, "div");
        addChild(notFound, "svg-icon", null, null, {
          name: "notfound-alt",
          width: "100",
          height: "100",
        });
        const el = addChild(notFound, "span", null, null, { "data-i18n-key": "not-found" });
      } else {
        letters = letters.concat(jsonData.data);
        virtualScroll();
      }

      this.nextCursor = jsonData.nextCursor;
      this.gettingCursor = null;
    };

    getLetters(folderSlug).then(addItems);
  }
}

window.customElements.define("letter-list", LetterList);
