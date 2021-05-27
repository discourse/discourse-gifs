import Controller from "@ember/controller";
import ModalFunctionality from "discourse/mixins/modal-functionality";
import { action } from "@ember/object";
import { popupAjaxError } from "discourse/lib/ajax-error";
import bootbox from "bootbox";

export default Controller.extend(ModalFunctionality, {
  loading: false,
  currentGifs: null,
  query: "",
  next_key: "",
  offset: 0,

  init() {
    this._super(...arguments);

    this.set("currentGifs", []);
  },

  @action
  pick(content) {
    this.appEvents.trigger(
      "composer:insert-text",
      `\n![${content.title}|${content.width}x${content.height}](${content.original})\n`
    );
    this.send("closeModal");
  },

  @action
  loadMore() {
    if (!this.loading) {
      this.search(false);
    }
  },

  @action
  refresh(query) {
    this.set("query", query);
    Ember.run.debounce(this, this.search, 700);
  },

  search(clearResults = true) {
    if (clearResults) {
      this.set("currentGifs", []);
      this.set("offset", 0);
    }

    if (this.query && this.query.length > 2) {
      this.set("loading", true);

      $.ajax({ url: this.getEndpoint(this.query, this.offset) })
        .done((response) => {
          const images = response.data.map((gif) => ({
            title: gif.title,
            preview:
              settings.giphy_file_format === "webp"
                ? gif.images.fixed_width.webp
                : gif.images.fixed_width.url,
            original:
              settings.giphy_file_format === "webp"
                ? gif.images.original.webp
                : gif.images.original.url,
            width: gif.images.original.width,
            height: gif.images.original.height,
          }));

          this.set(
            "offset",
            response.pagination.count + response.pagination.offset
          );
          this.get("currentGifs").addObjects(images);
        })
        .catch((error) => {
          if (error.status === 403) {
            bootbox.alert(I18n.t(themePrefix("gif.bad_api_key")));
          } else {
            popupAjaxError(error);
          }
        })
        .always(() => {
          this.set("loading", false);
        });
    }
  },

  onShow() {
    this.setProperties({
      loading: false,
      query: "",
      offset: 0,
      currentGifs: [],
    });
  },

  getEndpoint(query, offset) {
    return (
      "https://api.giphy.com/v1/gifs/search?" +
      $.param({
        limit: 24,
        q: query,
        offset: offset,
        api_key: settings.giphy_api_key,
        lang: settings.giphy_locale,
      })
    );
  },
});
