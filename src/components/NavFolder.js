class NavFolder extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const slug = this.getAttribute("slug");
    const link = document.createElement("a");
    link.setAttribute("data-link", ""); //used for SPA routing
    link.href = "/" + slug;
    const icon = document.createElement("svg-icon");
    icon.setAttribute("name", slug);
    link.appendChild(icon);

    const el = document.createElement("span");
    el.setAttribute("data-i18n-key", slug);
    link.appendChild(el);

    this.appendChild(link);
  }
}

window.customElements.define("nav-folder", NavFolder);
