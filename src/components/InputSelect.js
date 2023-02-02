import { addChild } from "../utils";

class InputSelect extends HTMLElement {
  constructor() {
    super();

    this.showValue = false;
    this.options = [];
    this.optionStyles = false; //отображение каждой опции в соответствии с ее стилем
    this.align = "normal";
    this.onChange = null;
    this.icon = null;

    this.isOpen = false;
    this.popover = null;
    this.valueEl = null;
  }

  close() {
    this.isOpen = false;
    this.removeChild(this.popover);
  }

  open() {
    this.isOpen = true;
    this.popover = addChild(this, "div", "popover");
    this.popover.style.alignItems = this.align;

    for (let option of this.options) {
      const child = addChild(
        this.popover,
        "div",
        "option",
        this.optionStyles ? `<span style="${option.style}">${option.name}</span>` : option
      );

      child.addEventListener("click", () => {
        if (this.showValue) this.valueEl.innerText = option;
        this.onChange(option);
        this.close();
      });
    }

    this.popover.addEventListener("click", (e) => e.stopPropagation());
  }

  connectedCallback() {
    const btn = addChild(this, "button");
    if (this.showValue) this.valueEl = addChild(btn, "span", null, this.value);
    if (this.icon)
      addChild(btn, "svg-icon", null, null, { width: "16", height: "16", name: this.icon });
    addChild(btn, "svg-icon", null, null, { width: "16", height: "16", name: "chevron_select" });

    btn.addEventListener("click", (e) => {
      if (this.isOpen) this.close();
      else this.open();

      e.stopPropagation();
    });

    document.addEventListener("click", () => {
      //close on click outside
      if (this.isOpen) this.close();
    });
  }
}

window.customElements.define("input-select", InputSelect);
