import { action } from "@ember/object";
import { withPluginApi } from "discourse/lib/plugin-api";
import GifModal from "../components/modal/gif";

export default {
  name: "discourse-gifs",

  initialize(container) {
    withPluginApi("0.1", (api) => {
      if (!api.container.lookup("site:main").mobileView) {
        api.onToolbarCreate((toolbar) => {
          if (toolbar.context.composerEvents) {
            toolbar.addButton({
              title: themePrefix("gif.composer_title"),
              id: "gif_button",
              group: "extras",
              icon: "discourse-gifs-gif",
              action: () => {
                const modal = api.container.lookup("service:modal");
                modal.show(GifModal);
              },
            });
          }
        });
      }

      const chat = api.container.lookup("service:chat");
      if (chat) {
        api.registerChatComposerButton?.({
          translatedLabel: themePrefix("gif.composer_title"),
          id: "gif_button",
          icon: "discourse-gifs-gif",
          action: "showChatGifModal",
          position: "dropdown",
        });

        api.modifyClass("component:chat-composer", {
          pluginId: "discourse-gifs",

          @action
          showChatGifModal(context) {
            const modal = api.container.lookup("service:modal");
            modal.show(GifModal, {
              model: {
                customPickHandler: (message) => {
                  api.sendChatMessage(this.currentMessage.channel.id, {
                    message,
                    threadId:
                      context === "thread"
                        ? this.currentMessage.thread.id
                        : null,
                  });
                },
              },
            });
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
