import { withPluginApi } from "discourse/lib/plugin-api";
import Composer from "discourse/components/d-editor";
import showModal from "discourse/lib/show-modal";

export default {
  name: "discourse-gifs",

  initialize(container) {
    withPluginApi("0.1", (api) => {
      Composer.reopen({
        actions: {
          showGifModal() {
            showModal("gif", {
              title: themePrefix("gif.modal_title"),
            }).set("composerView", this);
          },
        },
      });

      api.onToolbarCreate((toolbar) => {
        toolbar.addButton({
          title: themePrefix("gif.composer_title"),
          id: "gif_button",
          group: "extras",
          icon: "discourse-gifs-gif-icon",
          action: () => toolbar.context.send("showGifModal"),
        });
      });
    });

    // for old tenor gifs compat
    const caps = container.lookup("capabilities:main");
    if (caps.isSafari || caps.isIOS) {
      document.documentElement.classList.add("discourse-gifs-with-img");
    }
  },
};
