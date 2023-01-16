class UserAvatar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = this.author.avatar
      ? `<img class="avatar" src=${this.author.avatar} alt="Avatar"></img>`
      : `<div class="avatar">${this.author.name.charAt(0)}</div>`;
  }
}

window.customElements.define("user-avatar", UserAvatar);
