import { withPluginApi } from "discourse/lib/plugin-api";
import { showGifModal } from "../helpers/gif-modal";
import showModal from "discourse/lib/show-modal";

export default {
  name: "discourse-gifs",

  initialize(container) {
    withPluginApi("0.1", (api) => {
      if (!api.container.lookup("site:main").mobileView) {
        api.onToolbarCreate((toolbar) => {
          toolbar.addButton({
            title: themePrefix("gif.composer_title"),
            id: "gif_button",
            group: "extras",
            icon: "discourse-gifs-gif",
            action: showGifModal,
          });
        });
      }

      const chat = api.container.lookup("service:chat");
      if (chat) {
        chat.addToolbarButton({
          title: themePrefix("gif.composer_title"),
          id: "gif_button",
          group: "extras",
          icon: "discourse-gifs-gif",
          action: 'showChatGifModal',
        });

        api.modifyClass("component:chat-composer", {
          pluginId: "discourse-gifs",
          actions: {
            showChatGifModal() {
              const insertGif = this.addText.bind(this);
              showModal("gif").setProperties({
                customPickHandler: insertGif,
              });
            },
          },
        });
      }
    });

    // for old tenor gifs compat
    const caps = container.lookup("capabilities:main");
    if (caps.isSafari || caps.isIOS) {
      document.documentElement.classList.add("discourse-gifs-with-img");
    }
  },
};
