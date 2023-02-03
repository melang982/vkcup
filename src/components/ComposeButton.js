import { addChild, checkImage } from "../utils";
import { translateElement } from "../i18n";
import { initEditor } from "../editor";
import { getContacts, sendLetter } from "../api/api.js";
class ComposeButton extends HTMLElement {
  constructor() {
    super();

    this.isOpen = false;
    this.modal = null;
  }

  close() {
    this.isOpen = false;
    this.modal.parentElement.removeChild(this.modal);
  }

  open() {
    this.isOpen = true;

    getContacts().then((contacts) => (document.getElementById("editor__to").options = contacts));

    const template = document.getElementById("modal");
    document.getElementById("wrap").appendChild(template.content.cloneNode(true));
    this.modal = document.getElementById("modal__background");

    addChild(
      document.getElementById("editor__modal"),
      "user-avatar",
      "editor__avatar",
      null,
      null,
      {
        contact: { name: "Л" },
      }
    );

    translateElement(this.modal);

    this.modal.addEventListener("click", (e) => {
      if (this.isOpen && !e.dontCloseModal) this.close();
    });

    document.getElementById("editor__modal").addEventListener("click", (e) => {
      e.dontCloseModal = true;
    });

    document.getElementById("editor__send").addEventListener("click", () => {
      const form = document.getElementById("editor__form");
      console.log(form.elements);
      sendLetter({ title: form.elements.title.value, text: "hello text" }).then(() => this.close());
    });

    document.getElementById("editor__form").onsubmit = (e) => e.preventDefault();

    initEditor();

    document.querySelector("#editor__to input").focus();

    document.getElementById("editor__close").addEventListener("click", () => this.close());

    const fileInput = document.getElementById("editor__file");
    fileInput.addEventListener("change", (e) => {
      for (let file of e.target.files) {
        const { name: fileName, size } = file;
        const fileSize = (size / 1024).toFixed(2);

        let reader = new FileReader();

        reader.onload = (e) => {
          const filesEl = document.getElementById("editor__files");
          const fileEl = addChild(filesEl, "div", "editor__file");
          if (checkImage(fileName))
            addChild(fileEl, "img", null, null, {
              src: e.target.result,
            });
          else fileEl.textContent = fileName;

          const removeBtn = addChild(fileEl, "button");
          addChild(removeBtn, "svg-icon", null, null, { name: "close" });
          removeBtn.addEventListener("click", () => {
            const dataTransfer = new DataTransfer();
            Array.from(fileInput.files).forEach((x) => {
              if (x.name != fileName) dataTransfer.items.add(x);
            });

            fileInput.files = dataTransfer.files;
            filesEl.removeChild(fileEl);
          });
        };

        reader.readAsDataURL(file);
      }
    });
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
