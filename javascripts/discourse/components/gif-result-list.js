import Component from "@ember/component";

export default Component.extend({
  tagName: "div",
  classNames: ["gif-result-list"],
  observer: null,

  _setupInfiniteScrolling() {
    this.observer = new IntersectionObserver(() => {
      if (this.content && this.content.length > 0) {
        this.loadMore();
      }
    });

    let target = document.querySelector("div.gif-box div.loading-container");
    this.observer.observe(target);
  },

  didInsertElement() {
    this._setupInfiniteScrolling();
  },

  willDestroyElement() {
    this.observer.disconnect();
  },

  actions: {
    pick(gif) {
      this.pick(gif);
    },
  },
});
