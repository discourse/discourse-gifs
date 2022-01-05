import Controller from "@ember/controller";
import ModalFunctionality from "discourse/mixins/modal-functionality";
import { action } from "@ember/object";
import { popupAjaxError } from "discourse/lib/ajax-error";
import bootbox from "bootbox";
import { default as computed } from 'discourse-common/utils/decorators';

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

  @computed
  providerLogo() {
    return settings.theme_uploads.[`${settings.api_provider}-logo`];
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
          let images;
          if (settings.api_provider === "giphy") {
          // Giphy
          images = response.data.map((gif) => ({
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
          images = response.results.map((gif) => ({
            title: gif.title,
            preview: gif.media[0].tinygif.url,
            original: gif.media[0][`${settings.tenor_file_detail}`].url,
            width: gif.media[0][`${settings.tenor_file_detail}`].dims[0],
            height: gif.media[0][`${settings.tenor_file_detail}`].dims[1],
          }));
        }
          this.set(
            "offset",
            settings.api_provider === "giphy" ?
            response.pagination.count + response.pagination.offset :
            response.next
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
    if (settings.api_provider == "tenor") {
      return (
        "https://api.tenor.com/v1/search?" +
        $.param({
          limit: 24,
          q: query,
          pos: offset,
          media_filter: 'default',
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
          offset: offset,
          api_key: settings.giphy_api_key,
          lang: settings.giphy_locale,
          rating: settings.giphy_content_rating,
        })
      );
    }
  },
});
