import "./UserAvatar";
import { addChild, formatDate } from "../utils";

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
    const link = addChild(this, "a", "nav-btn" + (this.item.read ? "" : " unread"), null, {
      href: `/${this.getAttribute("folderSlug")}/${this.item.id}`,
      "data-link": "", //used for SPA routing
    });

    const dot = addChild(link, "button", "unread-dot");
    addChild(dot, "div");

    dot.addEventListener("click", (e) => e.preventDefault()); //не открываем письмо

    const avatar = document.createElement("user-avatar");
    if (this.item.author.avatar) avatar.setAttribute("src", this.item.author.avatar);
    else if (this.item.author.name)
      avatar.setAttribute("initials", this.item.author.name.charAt(0));
    link.appendChild(avatar);
    addChild(link, "input", null, null, { type: "checkbox" });

    addChild(
      link,
      "span",
      "letter-item__sender",
      `${this.item.author.name} ${this.item.author.surname}`
    );

    const icons = addChild(link, "span", "letter-item__icons");
    if (this.item.bookmark) addChild(icons, "svg-icon", null, null, { name: "bookmark" });
    else {
      addChild(icons, "svg-icon", null, null, { name: "bookmark_outline" });
      if (this.item.important) addChild(icons, "svg-icon", null, null, { name: "exclamation" });
    }
    const content = addChild(link, "span", "letter-item__content");
    addChild(content, "span", "letter-item__title", this.item.title);
    addChild(content, "span", "letter-item__text", this.item.text);

    if (this.item.flag)
      addChild(link, "img", null, null, {
        src: `/icons/categories/${categories.get(this.item.flag)}.svg`,
        alt: categories.get(this.item.flag) + " icon",
      });

    if (this.item.doc) {
      const attachButton = addChild(link, "button", "btn-attach", null);
      addChild(attachButton, "svg-icon", null, null, { name: "attach", width: "24", height: "24" });
      attachButton.addEventListener("click", (e) => {
        document.querySelectorAll(".btn-attach").forEach((btn) => btn.classList.remove("active"));
        const popup = document.getElementById("attach__popup");
        popup.style.display = "block";
        attachButton.appendChild(popup);
        attachButton.classList.add("active");
        e.stopPropagation(); //не закрываем попап
        e.preventDefault(); //не открываем письмо
      });
    }

    addChild(link, "span", "letter-item__date footnote", formatDate(this.item.date));
  }
}

window.customElements.define("letter-item", LetterItem);
