import Component from "@ember/component";
import { computed } from "@ember/object";

export default Component.extend({
  tagName: "div",
  classNames: ["gif-imgwrap"],

  click() {
    this.pick(this.content);
  }
});
