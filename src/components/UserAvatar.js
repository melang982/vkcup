class UserAvatar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = this.contact.avatar
      ? `<img class="avatar" src=${this.contact.avatar} alt="Avatar"></img>`
      : `<div class="avatar">${this.contact.name.charAt(0)}</div>`;
  }
}

window.customElements.define("user-avatar", UserAvatar);
