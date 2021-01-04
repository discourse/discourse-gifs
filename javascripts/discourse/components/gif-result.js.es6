import Component from "@ember/component";

export default Component.extend({
  tagName: "div",
  classNames: ["gif-imgwrap"],

  click() {
    this.pick(this.gif);
  }
});
