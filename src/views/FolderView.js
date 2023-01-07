import "../components/LetterList.js";
import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Входящие");
  }

  async getHtml() {
    return `<letter-list folderSlug=${this.params.folderSlug} />`;
  }
}
