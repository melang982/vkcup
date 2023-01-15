import "./LetterItem.js";
import { getLetters } from "../api/api.js";
import { addChild } from "../utils";
import { translateElement } from "../i18n/index.js";

class LetterList extends HTMLElement {
  constructor() {
    super();
    this.nextCursor = 0;
  }

  connectedCallback() {
    const observer = new IntersectionObserver( //бесконечный скролл
      (entries) => {
        if (entries[0].isIntersecting === true && this.nextCursor)
          getLetters(folderSlug, this.nextCursor).then(addItems);
      },
      { threshold: [0] }
    );

    const folderSlug = this.getAttribute("folderSlug");

    const addItems = (jsonData) => {
      if (jsonData.data.length == 0) {
        const notFound = addChild(this, "div", "not-found");
        addChild(notFound, "div");
        const el = addChild(notFound, "span", null, null, { "data-i18n-key": "not-found" });
        translateElement(el);
      } else
        for (let item of jsonData.data)
          addChild(this, "letter-item", null, null, { folderSlug: folderSlug }, { item: item });

      this.nextCursor = jsonData.nextCursor;

      observer.observe(document.querySelector("#infinite-scroll"));
    };

    getLetters(folderSlug).then(addItems);
  }
}

window.customElements.define("letter-list", LetterList);
