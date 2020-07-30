import Controller from "@ember/controller";
import ModalFunctionality from "discourse/mixins/modal-functionality";
import { action } from "@ember/object";

const cache = {};

export default Controller.extend(ModalFunctionality, {
  loading: false,
  currentGifs: null,
  query: "",
  next_key: "",

  init() {
    this._super(...arguments);

    this.set("currentGifs", []);
  },

  @action
  pick(content) {
    const markdownImg = `\n<div data-theme-discourse-gifs="container"><video muted loop autoplay playsinline width="${content.medium.dims[0]}" height="${content.medium.dims[1]}" poster="${content.medium.preview}"  alt="${content.title}" title="${content.title}"><source src="${content.medium.url}"></video><img src="${content.medium.url}" width="${content.medium.dims[0]}" height="${content.medium.dims[1]}"></div>\n`;

    if (this.composerViewOld) {
      this.composerViewOld.addMarkdown(markdownImg);
    } else if (this.composerView) {
      this.composerView._addText(this.composerView._getSelected(), markdownImg);
    }

    this.send("closeModal");
  },

  @action
  refresh(query) {
    this.set("query", query);
    Ember.run.debounce(this, this.search, 700);
  },

  search() {
    const query = this.query;

    if (query && query.length > 2) {
      this.set("loading", true);

      if (query in cache) {
        this.get("currentGifs").setObjects(cache[query]);
        this.set("loading", false);
      } else {
        $.ajax({ url: this.getEndpoint(query) }).done(response => {
          const images = response.results.map(gif => ({
            title: gif.title,
            preview: gif.media[0].nanomp4,
            medium: gif.media[0].mp4
          }));

          // save it
          cache[query] = images;

          // and send it
          this.get("currentGifs").setObjects(images);
          this.set("loading", false);
        });
      }
    }
  },

  onShow() {
    this.setProperties({
      loading: false,
      query: ""
    });
  },

  getEndpoint(query) {
    return (
      "https://api.tenor.com/v1/search?" +
      $.param({
        limit: 8,
        q: query
      })
    );
  }
});
