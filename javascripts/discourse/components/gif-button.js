import Component from "@glimmer/component";
import { showGifModal } from "../helpers/gif-modal";
import { action } from "@ember/object";

export default class GifButton extends Component {
  @action
  showGifModal() {
    showGifModal();
  }
}
