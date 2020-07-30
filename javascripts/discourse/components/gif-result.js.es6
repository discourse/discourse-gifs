import Component from "@ember/component";
import { computed } from "@ember/object";

export default Component.extend({
  tagName: "span",
  classNames: ["gif-imgwrap"],

  isiOS: computed(function() {
    return this.capabilities.isSafari || this.capabilities.isIOS;
  }),

  click() {
    this.pick(this.content);
  }
});
