import { withPluginApi } from "discourse/lib/plugin-api";
import Composer from "discourse/components/d-editor";
import showModal from "discourse/lib/show-modal";

function initializePlugin(api) {
  const siteSettings = api.container.lookup("site-settings:main");

    Composer.reopen({
      actions: {
        showGifModal: function() {
          showModal("gif", { title: themePrefix("gif.modal_title") }).setProperties({
            composerView: this
          });
        }
      }
    });

    api.onToolbarCreate(toolbar => {
      toolbar.addButton({
        title: themePrefix("gif.composer_title"),
        id: "gif_button",
        group: "extras",
        icon: "video",
        action: "showGifModal"
      });
    });
}

export default {
  name: "gif",
  initialize(container) {
    withPluginApi("0.1", initializePlugin);
  }
};
