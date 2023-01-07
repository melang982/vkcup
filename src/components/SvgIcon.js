class SvgIcon extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const width = this.getAttribute("width") ?? 20;
    const height = this.getAttribute("height") ?? 20;
    const path = `/icons/${this.getAttribute("name")}.svg#id`;
    this.innerHTML = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <use href=${path}></use>
  </svg>`;

    /*const el = document.createElement("img");
    el.setAttribute("src", `icons/${this.getAttribute("name")}.svg`);
    this.appendChild(el);*/
  }
}

window.customElements.define("svg-icon", SvgIcon);
