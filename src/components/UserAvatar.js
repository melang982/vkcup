class UserAvatar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = document.createElement("div");
    wrapper.className = "avatar__wrapper";
    this.appendChild(wrapper);
    const src = this.getAttribute("src");

    if (src) {
      const img = document.createElement("img");
      img.className = "avatar";
      img.setAttribute("src", src);
      img.setAttribute("alt", "Avatar");
      wrapper.appendChild(img);
    } else {
      const el = document.createElement("div");
      el.className = "avatar";
      wrapper.appendChild(el);
    }
  }
}

window.customElements.define("user-avatar", UserAvatar);
