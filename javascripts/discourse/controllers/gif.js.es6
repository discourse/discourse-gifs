import ModalFunctionality from "discourse/mixins/modal-functionality";

const cache = {};

export default Ember.Controller.extend(ModalFunctionality, {
  loading: false,
  currentGifs: [],
  query: "",
  next_key: "",

  actions: {
    pick: function(content) {
      const markdownImg = `\n<video muted loop autoplay width="${content.medium.dims[0]}" height="${content.medium.dims[1]}" poster="${content.medium.preview}"  alt="${content.title}" title="${content.title}"><source src="${content.medium.url}"></video>\n`;

      if (this.composerViewOld) {
        this.composerViewOld.addMarkdown(markdownImg);
      } else if (this.composerView) {
        this.composerView._addText(this.composerView._getSelected(), markdownImg);
      }

      this.send("closeModal");
    },
    refresh: function(query) {
      this.set("query", query);
      Ember.run.debounce(this, this.search, 300);
    }
  },

  search: function() {
    const query = this.get("query");

    if (query && query.length > 2) {
      this.set("loading", true);
      const params = {
        url: this.getEndpoint(query)
      };

      if (query in cache) {
        this.get("currentGifs").setObjects(cache[query]);
        this.set("loading", false);
      } else {
        $.ajax(params).done((response) => {

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

  onShow: function() {
    this.setProperties({
      loading: false,
      query: "",
    });
  },

  getEndpoint: function(query) {
    return "https://api.tenor.com/v1/search?" +
      $.param({
        limit: 8,
        q: query,
      });
  }
});
