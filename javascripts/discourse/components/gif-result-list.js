import Component from "@ember/component";
import MiniMasonry from "../lib/minimasonry";
import { next } from "@ember/runloop";

export default Component.extend({
  tagName: "div",
  classNames: ["gif-result-list"],
  observer: null,
  masonry: null,

  _setupInfiniteScrolling() {
    this.observer = new IntersectionObserver(() => {
      const scroller = document.querySelector(".gif-content");
      // ensure we don't load more if we haven't scrolled at all
      if (scroller?.scrollTop > 0 && this.content?.length > 0) {
        this.loadMore();
      }
    });

    let target = document.querySelector("div.gif-box div.loading-container");
    this.observer.observe(target);
  },

  didInsertElement() {
    this._super(...arguments);
    this._setupInfiniteScrolling();

    this.masonry = new MiniMasonry({
      container: ".gif-result-list",
      baseWidth: this.site.mobileView ? 145 : 200,
      surroundingGutter: false,
    });

    this.rearrangeMasonry();
  },

  didUpdateAttrs() {
    this._super(...arguments);
    this.rearrangeMasonry();
  },

  rearrangeMasonry() {
    next(() => {
      this.masonry.layout();
    });
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
