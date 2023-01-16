import { getSingleLetter } from "../api/api.js";
import { addChild } from "../utils";

class SingleLetter extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    getSingleLetter(this.getAttribute("id")).then((data) => {
      addChild(this, "h1", null, data.title);
      const header = addChild(this, "div", "letter__header");
      if (!data.read) addChild(header, "div", "unread-dot");
      addChild(header, "user-avatar", null, null, null, { author: data.author });

      const column = addChild(header, "div", "letter__header__column");
      addChild(column, "span", null, `${data.author.name} ${data.author.surname}`);
      addChild(column, "span", "letter__date footnote", null, {
        "data-i18n-letter-date": data.date,
      });
      if (data.important) addChild(column, "svg-icon", null, null, { name: "exclamation" });

      const recipientsEl = addChild(column, "div", "letter__recipients footnote");
      addChild(recipientsEl, "span", null, null, { "data-i18n-key": "to" });

      if (data.to.length > 0) {
        const recipients =
          ", " +
          data.to
            .slice(0, Math.min(3, data.to.length))
            .map((x) => x.name + " " + x.surname)
            .join(", ");

        const numOthers = data.to.length - 3;
        recipientsEl.innerHTML += recipients;

        if (numOthers > 0) {
          recipientsEl.innerHTML += " ";
          const linkEl = addChild(recipientsEl, "a", null, null, { href: "#" });
          addChild(linkEl, "span", null, null, { "data-i18n-key": "and" });
          linkEl.innerHTML += " ";

          addChild(linkEl, "span", null, null, {
            href: "#",
            "data-i18n-declination": "recipient",
            "data-i18n-num": numOthers,
          });
        }
      }

      if (data.flag) {
        const categoryWrapper = addChild(this, "div", "letter__category");
        addChild(categoryWrapper, "svg-icon", null, null, { name: data.flag });
        addChild(categoryWrapper, "span", null, null, { "data-i18n-key": data.flag });
      }

      if (data.doc) {
        const attachment = addChild(this, "a", "letter__attachment", null, {
          href: `/attachments/${data.id}.jpg`,
          download: "Image.jpg",
        });
        addChild(attachment, "img", null, null, {
          src: `/attachments/${data.id}.jpg`,
          alt: "attachment",
        });
        const download = addChild(attachment, "div", "letter__download");
        addChild(download, "svg-icon", null, null, { name: "download", width: 16, height: 16 });
        addChild(download, "span", null, null, { "data-i18n-key": "download" });

        const attachInfo = addChild(this, "div", "attachment__text", null);
        addChild(attachInfo, "span", null, null, {
          "data-i18n-declination": "file",
          "data-i18n-num": "1",
        });
        addChild(attachInfo, "a", null, null, {
          href: `/attachments/${data.id}.jpg`,
          download: "Image.jpg",
          "data-i18n-key": "download",
        });
        addChild(attachInfo, "span", "attachment__size", ` (${data.doc})`);
      }

      addChild(this, "span", null, data.text);
    });
  }
}

window.customElements.define("single-letter", SingleLetter);
