import Component from "@ember/component";

import { showGifModal } from "discourse/initializers/gif-integration";

export default Component.extend({
  tagName: "",

  actions: {
    showGifModal
  }
});

