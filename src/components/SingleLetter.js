import { getSingleLetter } from "../api/api.js";
import { addChild } from "../utils";
class SingleLetter extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    getSingleLetter(this.getAttribute("id")).then((data) => {
      //console.log(jsonData);
      //this.innerHTML = data.text;

      addChild(this, "span", null, data.text);

      if (data.doc)
        addChild(this, "img", null, null, {
          src: `/attachments/${data.id}.jpg`,
        });
    });
  }
}

window.customElements.define("single-letter", SingleLetter);
