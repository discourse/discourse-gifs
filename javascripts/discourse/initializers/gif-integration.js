import { addGlobalNotice } from "discourse/components/global-notice";
import getURL from "discourse/lib/get-url";
import { withPluginApi } from "discourse/lib/plugin-api";
import GifModal from "../components/modal/gif";

export default {
  name: "discourse-gifs",

  initialize(container) {
    withPluginApi((api) => {
      const siteSettings = api.container.lookup("service:site-settings");

      if (siteSettings.enable_gifs) {
        if (api.getCurrentUser()?.admin) {
          const themeId = themePrefix("id").match(
            /theme_translations\.(\d+)\./
          )[1];
          const themeURL = getURL(`/admin/customize/themes/${themeId}`);

          addGlobalNotice(
            `<b>Admin notice:</b> you're using the <em>discourse-gifs</em> theme component. GIF support is now built into Discourse core (the <em>enable gifs</em> site setting is enabled). You should <a href="${themeURL}">remove this theme component</a> and see <a href="https://meta.discourse.org/t/gifs-are-moving-to-discourse-core/404829">the announcement</a> on how to replace it.`,
            "discourse-gifs-theme",
            {
              dismissable: true,
              level: "warn",
              dismissDuration: moment.duration("1", "hour"),
            }
          );
        }

        // return early if core implementation is enabled
        return;
      }

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

      const chat = api.container.lookup("service:chat");
      const currentUser = api.container.lookup("service:current-user");

      if (chat) {
        const modal = api.container.lookup("service:modal");
        api.registerChatComposerButton({
          translatedLabel: themePrefix("gif.composer_title"),
          id: "gif_button",
          icon: "discourse-gifs-gif",
          position: "dropdown",
          async action(context) {
            await modal.show(GifModal, {
              model: {
                customPickHandler: (message) => {
                  api.sendChatMessage(this.draft.channel.id, {
                    message,
                    threadId:
                      context === "thread" ? this.draft.thread.id : null,
                    inReplyToId:
                      context === "channel" ? this.draft.inReplyTo?.id : null,
                  });
                },
              },
            });

            this.draft.channel.resetDraft(currentUser);
          },
        });
      }
    });

    // for old tenor gifs compat
    const caps = container.lookup("service:capabilities");
    if (caps.isSafari || caps.isIOS) {
      document.documentElement.classList.add("discourse-gifs-with-img");
    }
  },
};
