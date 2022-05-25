import Component from "@ember/component";
import { showGifModal } from "../helpers/gif-modal";

export default Component.extend({
  tagName: "",

  actions: {
    showGifModal,
  },
});
