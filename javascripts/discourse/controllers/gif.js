import Controller from "@ember/controller";
import ModalFunctionality from "discourse/mixins/modal-functionality";
import { action } from "@ember/object";
import bootbox from "bootbox";
import discourseComputed from "discourse-common/utils/decorators";
import discourseDebounce from "discourse-common/lib/debounce";
import I18n from "I18n";

export default Controller.extend(ModalFunctionality, {
  customPickHandler: null,
  loading: false,
  currentGifs: null,
  query: "",
  next_key: "",
  offset: 0,

  init() {
    this._super(...arguments);

    this.set("currentGifs", []);
  },

  @discourseComputed
  providerLogo() {
    return settings.theme_uploads[`${settings.api_provider}-logo`];
  },

  @action
  pick(content) {
    let markup = `\n![${content.title}|${content.width}x${content.height}](${content.original})\n`;

    if (this.customPickHandler) {
      this.customPickHandler(markup);
    } else {
      this.appEvents.trigger("composer:insert-text", markup);
    }
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
    discourseDebounce(this, this.search, 700);
  },

  async search(clearResults = true) {
    if (clearResults) {
      this.set("currentGifs", []);
      this.set("offset", 0);
    }

    if (this.query && this.query.length > 2) {
      this.set("loading", true);

      try {
        const response = await fetch(this.getEndpoint(this.query, this.offset));

        if (response.status === 403) {
          throw new Error(I18n.t(themePrefix("gif.bad_api_key")));
        } else if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();
        let images;

        if (settings.api_provider === "giphy") {
          // Giphy
          images = data.data.map((gif) => ({
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
        } else {
          // Tenor
          images = data.results.map((gif) => ({
            title: gif.title,
            preview: gif.media[0].tinygif.url,
            original: gif.media[0][`${settings.tenor_file_detail}`].url,
            width: gif.media[0][`${settings.tenor_file_detail}`].dims[0],
            height: gif.media[0][`${settings.tenor_file_detail}`].dims[1],
          }));
        }

        this.set(
          "offset",
          settings.api_provider === "giphy"
            ? data.pagination.count + data.pagination.offset
            : data.next
        );

        this.currentGifs.addObjects(images);
      } catch (error) {
        bootbox.alert(error);
      } finally {
        this.set("loading", false);
      }
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
    if (settings.api_provider === "tenor") {
      return (
        "https://g.tenor.com/v1/search?" +
        $.param({
          limit: 24,
          q: query,
          pos: offset,
          media_filter: "default",
          key: settings.tenor_api_key,
          locale: settings.giphy_locale,
          contentfilter: settings.tenor_content_filter,
        })
      );
    } else {
      return (
        "https://api.giphy.com/v1/gifs/search?" +
        $.param({
          limit: 24,
          q: query,
          offset,
          api_key: settings.giphy_api_key,
          lang: settings.giphy_locale,
          rating: settings.giphy_content_rating,
        })
      );
    }
  },
});
