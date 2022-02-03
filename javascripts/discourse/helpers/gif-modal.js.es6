import showModal from "discourse/lib/show-modal";

export function showGifModal() {
  showModal("gif", {
    title: themePrefix("gif.modal_title"),
  }).setProperties({
    customPickHandler: null,
  });
}
