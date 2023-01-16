import "./UserAvatar";
import { addChild } from "../utils";

class LetterItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const link = addChild(this, "a", this.item.read ? "" : " unread", null, {
      href: `/${this.getAttribute("folderSlug")}/${this.item.id}`,
      "data-link": "", //used for SPA routing
    });

    const dot = addChild(link, "button", "unread-dot__wrapper");
    addChild(dot, "div", "unread-dot");

    dot.addEventListener("click", (e) => e.preventDefault()); //не открываем письмо

    addChild(link, "user-avatar", null, null, null, { author: this.item.author });

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

    if (this.item.flag) {
      addChild(link, "img", null, null, {
        src: `/icons/${this.item.flag}.svg`,
        alt: `${this.item.flag} icon`,
        width: 20,
        height: 20,
      });
    }

    if (this.item.doc) {
      const attachButton = addChild(link, "button", "btn-attach", null);
      addChild(attachButton, "svg-icon", null, null, { name: "attach", width: "24", height: "24" });

      attachButton.addEventListener("click", (e) => {
        //попап с вложениями:
        document.querySelectorAll("letter-item").forEach((btn) => btn.classList.remove("active"));
        const popup = document.getElementById("attach__popup");

        const url = `/attachments/${this.item.id}.jpg`;

        popup.querySelectorAll("img").forEach((img) => img.setAttribute("src", url));
        popup.querySelector(".attachment").setAttribute("href", url);
        document.getElementById("attach__preview").setAttribute("href", url);

        document.getElementById("attach__size").innerHTML = this.item.doc;
        popup.style.display = "block";
        attachButton.appendChild(popup);
        this.classList.add("active");
        e.stopPropagation(); //не закрываем попап
        e.preventDefault(); //не открываем письмо
      });
    }

    addChild(link, "span", "letter-item__date footnote", null, {
      "data-i18n-date": this.item.date,
    });
  }
}

window.customElements.define("letter-item", LetterItem);
