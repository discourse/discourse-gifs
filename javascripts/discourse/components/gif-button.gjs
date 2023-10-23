import Component from "@glimmer/component";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import icon from "discourse-common/helpers/d-icon";
import i18n from "discourse-common/helpers/i18n";
import GifModal from "../components/modal/gif";

export default class GifButton extends Component {
  @service modal;

  @action
  showGifModal() {
    this.modal.show(GifModal);
  }

  <template>
    <button
      type="button"
      class="btn btn-default no-text mobile-gif-insert"
      aria-label={{i18n (themePrefix "gif.composer_title")}}
      {{on "click" this.showGifModal}}
    >
      {{icon "discourse-gifs-gif"}}
    </button>
  </template>
}
