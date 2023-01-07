import AbstractView from "./AbstractView.js";
import "../components/SingleLetter";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Письмо");
  }

  async getHtml() {
    return `<single-letter id=${this.params.id} />`;
  }
}
