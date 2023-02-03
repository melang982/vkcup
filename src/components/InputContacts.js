import { addChild } from "../utils";

class InputContacts extends HTMLElement {
  constructor() {
    super();

    this.options = [];
    this.value = [];

    this.isOpen = false;
    this.popover = null;
    this.chips = null;
    this.inputWrapper = null;
    this.inputEl = null;
    this.displayedOptions = [];
  }

  close() {
    this.isOpen = false;
    this.inputWrapper.removeChild(this.popover);
  }

  addContact(contact) {
    this.value.push(contact);
    const chip = addChild(this.chips, "span", "contact");

    addChild(chip, "user-avatar", null, null, null, { contact: contact });
    addChild(
      chip,
      "span",
      null,
      contact.surname ? `${contact.name} ${contact.surname[0]}` : contact.name
    );
    const closeBtn = addChild(chip, "button");
    addChild(closeBtn, "svg-icon", null, null, { name: "close" });

    closeBtn.addEventListener("click", () => {
      this.value.splice(
        this.value.findIndex((x) => x.email == contact.email),
        1
      );
      this.chips.removeChild(chip);
    });
    this.inputEl.value = "";
  }

  updateOptions() {
    this.popover.innerHTML = "";

    for (let contact of this.displayedOptions) {
      const div = addChild(this.popover, "div", "option");
      addChild(div, "user-avatar", null, null, null, { contact: contact });
      const column = addChild(div, "div");
      addChild(column, "div", null, `${contact.name} ${contact.surname}`);
      addChild(column, "div", "contact__email", contact.email);

      div.addEventListener("click", () => {
        this.addContact(contact);
        this.close();
        this.inputEl.focus();
      });
    }
  }

  open() {
    this.isOpen = true;
    this.displayedOptions = [...this.options];
    this.popover = addChild(this.inputWrapper, "div", "popover");

    this.popover.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    this.updateOptions();
  }

  connectedCallback() {
    addChild(this, "label", null, null, { "data-i18n-key": "to-whom" });
    this.chips = addChild(this, "div", "chips");
    this.inputWrapper = addChild(this, "div", "contacts__wrapper");
    this.inputEl = addChild(this.inputWrapper, "input", null, this.value, { type: "text" });

    this.inputWrapper.addEventListener("click", (e) => {
      if (this.isOpen) this.close();
      else this.open();

      e.stopPropagation();
    });

    this.inputEl.addEventListener("input", (e) => {
      if (!this.isOpen) this.open();

      if (e.target.value.endsWith(" ")) {
        let contact = this.options.find((x) => x.email == e.target.value.trimEnd());
        if (!contact) contact = { email: e.target.value, name: e.target.value.split("@")[0] };
        this.addContact(contact);
      } else
        this.displayedOptions = this.options.filter((x) =>
          (x.email + x.name + x.surname).includes(e.target.value)
        );
      this.updateOptions();
    });

    this.inputEl.addEventListener("keydown", (e) => {
      const key = e.keyCode || e.charCode;

      if (key == 8 && this.value.length) {
        //backspace
        this.value.pop();
        this.chips.removeChild(this.chips.lastChild);
      }
    });

    document.addEventListener("click", () => {
      //close on click outside
      if (this.isOpen) this.close();
    });
  }
}

window.customElements.define("input-contacts", InputContacts);
