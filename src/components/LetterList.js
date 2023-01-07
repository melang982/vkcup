import "./LetterItem.js";
import { getLetters } from "../api/api.js";

class LetterList extends HTMLElement {
  constructor() {
    super();
    this.nextCursor = 0;
  }

  connectedCallback() {
    console.log("connectedCallback letterlist");
    const observer = new IntersectionObserver( //бесконечный скролл
      (entries) => {
        if (entries[0].isIntersecting === true) {
          //console.log("Element has just become visible in screen");
          if (this.nextCursor) getLetters(folderSlug, this.nextCursor).then(addItems);
        }
      },
      { threshold: [0] }
    );

    const folderSlug = this.getAttribute("folderSlug");

    const addItems = (jsonData) => {
      for (let item of jsonData.data) {
        const comp = document.createElement("letter-item");
        comp.setAttribute("folderSlug", folderSlug);
        comp.item = item;
        this.appendChild(comp);
      }
      this.nextCursor = jsonData.nextCursor;
      observer.observe(document.querySelector("#infinite-scroll"));
    };

    getLetters(folderSlug).then(addItems);
  }
}

window.customElements.define("letter-list", LetterList);
