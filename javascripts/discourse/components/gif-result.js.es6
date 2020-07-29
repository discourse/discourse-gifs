import Component from "@ember/component";

export default Component.extend({
  tagName: "span",
  classNames: ["gif-imgwrap"],

  click() {
    this.pick(this.content);
  }
});
