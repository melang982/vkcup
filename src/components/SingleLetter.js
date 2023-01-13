import { getSingleLetter } from "../api/api.js";
import { addChild } from "../utils";
import { letterDate, getDeclination } from "../i18n";

class SingleLetter extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    getSingleLetter(this.getAttribute("id")).then((data) => {
      addChild(this, "h1", null, data.title);
      const header = addChild(this, "div", "letter__header");
      if (!data.read) addChild(header, "div", "unread-dot");
      const column = addChild(header, "div", "letter__header__column");
      addChild(column, "span", null, `${data.author.name} ${data.author.surname}`);
      addChild(column, "span", "footnote", letterDate(data.date));
      if (data.important) addChild(column, "svg-icon", null, null, { name: "exclamation" });

      let recipients = `<span data-i18n-key="to"></span>`;
      if (data.to.length > 0)
        recipients +=
          ", " +
          data.to
            .slice(0, Math.min(3, data.to.length))
            .map((x) => x.name + " " + x.surname)
            .join(", ");
      const numOthers = data.to.length - 3;
      const others = numOthers <= 0 ? null : " ещё " + getDeclination(numOthers, "recipient");
      const recipientsEl = addChild(column, "span", "letter__recipients footnote");
      recipientsEl.innerHTML = recipients;

      addChild(this, "span", null, data.text);

      /*if (data.doc)
        addChild(this, "img", null, null, {
          src: `/attachments/${data.id}.jpg`,
        });*/
    });
  }
}

window.customElements.define("single-letter", SingleLetter);
