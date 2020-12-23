import Controller from "@ember/controller";
import ModalFunctionality from "discourse/mixins/modal-functionality";
import { action } from "@ember/object";

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
    const markdownImg = `\n![${content.title}|${content.original.width}x${content.original.height}](${content.original.webp})\n`;

    if (this.composerViewOld) {
      this.composerViewOld.addMarkdown(markdownImg);
    } else if (this.composerView) {
      this.composerView._addText(this.composerView._getSelected(), markdownImg);
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
    Ember.run.debounce(this, this.search, 700);
  },

  search(clearResults = true) {
    if(clearResults) {
      this.set("currentGifs", []);
      this.set("offset", 0);
    }

    if (this.query && this.query.length > 2) {
      this.set("loading", true);

      $.ajax({ url: this.getEndpoint(this.query, this.offset) }).done((response) => {
        const images = response.data
          .map((gif) => ({
            title: gif.title,
            preview: gif.images.fixed_width_small,
            original: gif.images.original,
          }));

        this.set("offset", response.pagination.count+response.pagination.offset);
        this.get("currentGifs").addObjects(images);
        this.set("loading", false);
      });
    }
  },

  onShow() {
    this.setProperties({
      loading: false,
      query: "",
      offset: 0,
      currentGifs: []
    });
  },

  getEndpoint(query, offset) {
    return (
      "https://api.giphy.com/v1/gifs/search?" +
      $.param({
        limit: 24,
        q: query,
        offset: offset,
        api_key: settings.giphy_api_key
      })
    );
  },
});
