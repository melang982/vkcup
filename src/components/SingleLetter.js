import { getSingleLetterWithCache } from "../api/api.js";

class SingleLetter extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    getSingleLetterWithCache(this.getAttribute("id")).then((jsonData) => {
      //console.log(jsonData);
      this.innerHTML = jsonData.text;
    });
  }
}

window.customElements.define("single-letter", SingleLetter);
