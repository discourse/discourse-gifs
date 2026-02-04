import Component from "@glimmer/component";
import { fn } from "@ember/helper";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { htmlSafe } from "@ember/template";
import concatClass from "discourse/helpers/concat-class";

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
      class={{concatClass
        "gif-imgwrap"
        (if @gif.isCategory "gif-category-item")
      }}
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
      {{#if @gif.isCategory}}
        <span class="gif-category-label">{{@gif.title}}</span>
      {{/if}}
    </div>
  </template>
}
