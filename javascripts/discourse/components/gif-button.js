import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import GifModal from "../components/modal/gif";

export default class GifButton extends Component {
  @service modal;

  @action
  showGifModal() {
    this.modal.show(GifModal);
  }
}
