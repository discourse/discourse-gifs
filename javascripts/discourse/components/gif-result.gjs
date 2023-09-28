import Component from "@glimmer/component";
import { on } from "@ember/modifier";
import { fn } from "@ember/helper";
import { htmlSafe } from "@ember/template";
import { action } from "@ember/object";

export default class GifResult extends Component {
  <template>
    <div
      {{on "click" (fn @pick @gif)}}
      {{on "keydown" this.keyDown}}
      role="button"
      tabindex="0"
      class="gif-imgwrap"
    >
      <img
        class="gif-img"
        alt={{@gif.title}}
        title={{@gif.title}}
        src={{@gif.preview}}
        style={{this.style}}
        width={{@gif.width}}
        height={{@gif.height}}
      />
    </div>
  </template>

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
