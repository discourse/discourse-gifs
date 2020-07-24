export default Ember.Component.extend({
  tagName: "span",
  classNames: ["gif-imgwrap"],
  style: "display:inline-block;margin-bottom:3px;",

  click: function() {
    this.sendAction("pick", this.get("content"));
  }
});
