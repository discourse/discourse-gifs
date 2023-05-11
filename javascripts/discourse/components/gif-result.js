import discourseComputed from "discourse-common/utils/decorators";
import Component from "@ember/component";
import { htmlSafe } from "@ember/template";

export default Component.extend({
  tagName: "div",
  classNames: ["gif-imgwrap"],
  attributeBindings: ["role", "tabindex"],
  role: "button",
  tabindex: 0,

  @discourseComputed("gif.width", "gif.height")
  style(width, height) {
    if (width && height) {
      return htmlSafe(`--aspect-ratio: ${width / height};`);
    }
  },

  keyDown(event) {
    if (event.key === "Enter") {
      this.pick(this.gif);
      return false;
    }
  },

  click() {
    this.pick(this.gif);
    return false;
  },
});
