import { addChild } from "../utils";
import { translateElement } from "../i18n";
import { initEditor } from "../editor";

class ComposeButton extends HTMLElement {
  constructor() {
    super();

    this.isOpen = false;
    this.modal = null;
  }

  close() {
    this.isOpen = false;
    modal.parentElement.removeChild(this.modal);
  }

  open() {
    this.isOpen = true;
    const template = document.getElementById("modal");
    document.getElementById("wrap").appendChild(template.content.cloneNode(true));
    this.modal = document.getElementById("modal__background");
    translateElement(this.modal);

    this.modal.addEventListener("click", (e) => {
      if (this.isOpen && !e.dontCloseModal) this.close();
    });

    document.getElementById("editor__modal").addEventListener("click", (e) => {
      e.dontCloseModal = true;
    });

    initEditor();
  }

  connectedCallback() {
    const btn = addChild(this, "button", "btn-compose", null, { "data-i18n-key": "compose" });

    btn.addEventListener("click", (e) => {
      if (this.isOpen) this.close();
      else this.open();
      e.stopPropagation();
    });
  }
}

window.customElements.define("compose-button", ComposeButton);
