import "./LetterItem.js";
import { getLettersWithCache } from "../api/api.js";

class LetterList extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const folderSlug = this.getAttribute("folderSlug");
    getLettersWithCache(folderSlug).then((jsonData) => {
      for (let item of jsonData.data) {
        const comp = document.createElement("letter-item");
        comp.setAttribute("folderSlug", folderSlug);
        comp.item = item;
        this.appendChild(comp);
      }
    });
  }
}

window.customElements.define("letter-list", LetterList);
