import "./UserAvatar";
import { addChild } from "../utils";

const categories = new Map([
  ["Заказы", "shopping"],
  ["Финансы", "money"],
  ["Регистрации", "key"],
  ["Путешествия", "plane"],
  ["Билеты", "ticket"],
  ["Штрафы и налоги", "government"],
]);

class LetterItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const link = addChild(
      this,
      "a",
      "letter-item nav-btn" + (this.item.read ? "" : " unread"),
      null,
      {
        href: `/${this.getAttribute("folderSlug")}/${this.item.id}`,
        "data-link": "", //used for SPA routing
      }
    );

    if (!this.item.read) addChild(link, "div", "unread-icon");

    addChild(
      link,
      "user-avatar",
      null,
      null,
      this.item.author.avatar && { src: this.item.author.avatar }
    );

    addChild(
      link,
      "span",
      "letter-item__sender",
      `${this.item.author.name} ${this.item.author.surname}`
    );

    const icons = addChild(link, "span", "letter-item__icons");
    if (this.item.bookmark) addChild(icons, "svg-icon", null, null, { name: "bookmark" });
    if (this.item.important) addChild(icons, "svg-icon", null, null, { name: "exclamation" });

    const content = addChild(link, "span", "letter-item__content");
    addChild(content, "span", "letter-item__title", this.item.title);
    addChild(content, "span", "letter-item__text", this.item.text);

    if (this.item.flag)
      addChild(link, "img", null, null, {
        src: `/icons/categories/${categories.get(this.item.flag)}.svg`,
        alt: categories.get(this.item.flag) + " icon",
      });
  }
}

window.customElements.define("letter-item", LetterItem);
