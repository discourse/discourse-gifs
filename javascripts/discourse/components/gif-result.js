import Component from "@glimmer/component";
import { htmlSafe } from "@ember/template";
import { action } from "@ember/object";

export default class GifResult extends Component {
  get style() {
    const { width, height } = this.args.gif;

    if (width && height) {
      return htmlSafe(`--aspect-ratio: ${width / height};`);
    }
  }

  @action
  keyDown(event) {
    if (event.key === "Enter") {
      this.args.pick(this.args.gif);
    }
  }
}
