import discourseComputed from "discourse-common/utils/decorators";
import Component from "@ember/component";

export default Component.extend({
  tagName: "div",
  classNames: ["gif-imgwrap"],
  classNameBindings: ["tallOne", "tallTwo"],
  attributeBindings: ["role", "tabindex"],
  role: "button",
  tabindex: 0,

  @discourseComputed("gif.height", "gif.width")
  tallOne(height, width) {
    return height / width > 1.5;
  },

  @discourseComputed("gif.height", "gif.width")
  tallTwo(height, width) {
    return height / width > 1 && height / width < 1.5;
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
