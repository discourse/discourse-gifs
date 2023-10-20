import Component from "@glimmer/component";
import { fn } from "@ember/helper";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { htmlSafe } from "@ember/template";

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
}
