import Component from "@glimmer/component";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import MiniMasonry from "../lib/minimasonry";
import { schedule } from "@ember/runloop";
import GifResult from "./gif-result";
import ConditionalLoadingSpinner from "discourse/components/conditional-loading-spinner";

export default class GifResultList extends Component {
  <template>
    <div
      {{didInsert this.setup}}
      {{didUpdate this.update @content}}
      class="gif-result-list"
    >
      {{#each @content as |result|}}
        <GifResult @gif={{result}} @pick={{@pick}} />
      {{/each}}

      <ConditionalLoadingSpinner @condition={{this.loading}} />
    </div>
  </template>

  @service site;

  observer;
  masonry;

  willDestroy() {
    this.observer.disconnect();
  }

  @action
  setup() {
    this.observer = new IntersectionObserver(() => {
      const scroller = document.querySelector(".gif-content");
      // ensure we don't load more if we haven't scrolled at all
      if (scroller?.scrollTop > 0 && this.args.content?.length > 0) {
        this.args.loadMore();
      }
    });

    let target = document.querySelector("div.gif-box div.loading-container");
    this.observer.observe(target);

    this.masonry = new MiniMasonry({
      container: ".gif-result-list",
      baseWidth: this.site.mobileView ? 145 : 200,
      surroundingGutter: false,
    });

    schedule("afterRender", () => this.masonry.layout());
  }

  @action
  update() {
    schedule("afterRender", () => this.masonry.layout());
  }
}
