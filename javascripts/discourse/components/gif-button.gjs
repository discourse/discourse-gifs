import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { on } from "@ember/modifier";
import icon from "discourse-common/helpers/d-icon";
import { themeI18n } from "discourse/helpers/theme-helpers";
import GifModal from "../components/modal/gif";

export default class GifButton extends Component {
  <template>
    <button
      type="button"
      class="btn btn-default no-text mobile-gif-insert"
      aria-label={{themeI18n "gif.composer_title"}}
      {{on "click" this.showGifModal}}
    >
      {{icon "discourse-gifs-gif"}}
    </button>
  </template>

  @service modal;

  @action
  showGifModal() {
    this.modal.show(GifModal);
  }
}
