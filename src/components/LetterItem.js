import "./UserAvatar";
import { addChild } from "../utils";

class LetterItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const folderSlug = this.getAttribute("folderSlug");

    const link = addChild(this, "a", this.item.read ? "" : " unread", null, {
      href: `/${folderSlug}/${this.item.id}`,
      "data-link": "", //used for SPA routing
    });

    const dot = addChild(link, "button", "unread-dot__wrapper");
    addChild(dot, "div", "unread-dot");

    dot.addEventListener("click", (e) => e.preventDefault()); //не открываем письмо

    let contact = this.item.author; //В отправленных отображается имя и аватар того, кому послали письмо
    if (folderSlug == "sent") contact = this.item.to[0];

    addChild(link, "user-avatar", null, null, null, { contact: contact });

    addChild(link, "input", null, null, { type: "checkbox" });

    let fullName = contact.name;
    if (contact.surname) fullName += " " + contact.surname;

    addChild(link, "span", "letter-item__sender", fullName);

    const icons = addChild(link, "span", "letter-item__icons");
    if (this.item.bookmark) addChild(icons, "svg-icon", null, null, { name: "bookmark" });
    else {
      addChild(icons, "svg-icon", null, null, { name: "bookmark_outline" });
      if (this.item.important) addChild(icons, "svg-icon", null, null, { name: "exclamation" });
    }
    const content = addChild(link, "span", "letter-item__content");
    addChild(
      content,
      "span",
      "letter-item__title",
      this.item.title.length ? this.item.title : "(no subject)"
    );
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
