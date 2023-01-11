class UserAvatar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const src = this.getAttribute("src");

    this.innerHTML = src
      ? `<img class="avatar" src=${src} alt="Avatar"></img>`
      : `<div class="avatar">${this.getAttribute("initials")}</div>`;
  }
}

window.customElements.define("user-avatar", UserAvatar);
