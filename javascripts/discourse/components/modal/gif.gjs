import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { Input } from "@ember/component";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { service } from "@ember/service";
import DModal from "discourse/components/d-modal";
import loadingSpinner from "discourse/helpers/loading-spinner";
import discourseDebounce from "discourse/lib/debounce";
import { i18n } from "discourse-i18n";
import GifResultList from "../gif-result-list";

export default class Gif extends Component {
  @service appEvents;
  @service dialog;

  @tracked currentGifs = [];
  @tracked loading = false;
  @tracked offset = 0;
  @tracked query = "";

  get providerLogo() {
    return settings.theme_uploads[`${settings.api_provider}-logo`];
  }

  @action
  pick(content) {
    let markup = [
      "\n",
      `![${content.title}|${content.width}x${content.height}](${content.original})`,
      "\n",
    ].join("");

    if (this.args.model?.customPickHandler) {
      this.args.model.customPickHandler(markup);
    } else {
      this.appEvents.trigger("composer:insert-text", markup);
    }

    this.args.closeModal();
  }

  @action
  async loadMore() {
    if (!this.loading) {
      await this.search(false);
    }
  }

  @action
  refresh(event) {
    this.query = event.target.value;
    discourseDebounce(this, this.search, 700);
  }

  async search(clearResults = true) {
    if (clearResults) {
      this.currentGifs = [];
      this.offset = 0;
    }

    // Check for minimum search query and if search result limit was set & reached
    if (
      (this.query.length > 2 && !settings.limit_infinite_search_results) ||
      (settings.limit_infinite_search_results &&
        this.currentGifs.length < settings.max_results_limit)
    ) {
      this.loading = true;

      try {
        if (
          (settings.api_provider === "tenor" &&
            settings.tenor_api_key === "") ||
          (settings.api_provider === "giphy" && settings.giphy_api_key === "")
        ) {
          throw new Error(`${settings.api_provider.toUpperCase()} API key is not set. Site Admins, \
            please visit the "Discourse Gifs" theme-component topic on Discourse Meta \
            for setup instructions.`);
        }

        const response = await fetch(this.getEndpoint(this.query, this.offset));

        if (this.isDestroying || this.isDestroyed) {
          return;
        }

        if (!response.ok) {
          // Use the same errorMsg variable to handle variable replacement at the end for API Provider Display Name $api_provider.
          let errorMsg;

          // Only check for certain errors if setting is configured to do so.
          // This is to allow server admins time & the choice to update the custom messages. Existing Plugin users will have this setting disabled by default.
          if (response.status === 429) {
            errorMsg = i18n(themePrefix("gif.error_rate_limit"));
          } else if (response.status === 414) {
            errorMsg = i18n(themePrefix("gif.error_search_too_long"));
          } else if (response.status === 403 || response.status === 401) {
            errorMsg = i18n(themePrefix("gif.bad_api_key"));
          }

          // Parse Error Messages from Tenor if one isn't set yet
          if (
            !errorMsg &&
            settings.api_provider === "tenor" &&
            response.headers.get("content-type")?.includes("application/json")
          ) {
            const errorResponse = await response.json();

            // Check for API Key Errors first
            if (
              errorResponse.error.details.find(
                (e) => e.reason === "API_KEY_INVALID"
              ) !== undefined
            ) {
              errorMsg = i18n(themePrefix("gif.bad_api_key"));
            } else {
              // Map Error Message according to default Google API standards
              throw new Error(
                `Tenor Error Code ${errorResponse.error.code}: ${
                  errorResponse.error.message
                } [${errorResponse.error.details
                  .map((e) => e.reason)
                  .join(", ")}]`
              );
            }
          }

          // If error message is set, check if the API Provider variable was used.
          // Replace if needed - throw at the end of it.
          if (errorMsg) {
            throw new Error(
              errorMsg.replaceAll(
                "$api_provider",
                settings.api_provider.toUpperCase()
              )
            );
          } else {
            // Fallback to returning the entire response along with a status code.
            throw new Error(
              `${settings.api_provider.toUpperCase()} Status ${
                response.status
              }: ${await response.text()}`
            );
          }
        }

        const data = await response.json();
        if (this.isDestroying || this.isDestroyed) {
          return;
        }

        let images;

        if (settings.api_provider === "giphy") {
          images = data.data.map((gif) => {
            const sizeVariant = gif.images[settings.giphy_size_variant];
            const isWebp = settings.giphy_file_format === "webp";

            return {
              title: gif.title,
              preview:
                settings.giphy_file_format === "webp"
                  ? gif.images.fixed_width.webp
                  : gif.images.fixed_width.url,
              original: isWebp && sizeVariant.webp ? sizeVariant.webp : sizeVariant.url,
              width: parseInt(sizeVariant.width, 10),
              height: parseInt(sizeVariant.height, 10),
            };
          });
        } else {
          // Tenor
          images = data.results.map((gif) => {
            // Use tinygif as default for previews and "preview" as a backup
            const hasTinyGif = "tinygif" in gif.media_formats;

            // Use user-defined file format for attached GIFS and "preview" as a backup
            const media_format =
              settings.tenor_file_detail in gif.media_formats
                ? gif.media_formats[`${settings.tenor_file_detail}`]
                : gif.media_formats.preview;

            return {
              title: gif.title,
              preview: hasTinyGif
                ? gif.media_formats.tinygif.url
                : gif.media_formats.preview.url,
              original: media_format.url,
              width: media_format.dims[0],
              height: media_format.dims[1],
            };
          });
        }

        // Handle offset differences between Giphy and Tenor
        this.offset =
          settings.api_provider === "giphy"
            ? data.pagination.offset + data.pagination.count
            : data.next === ""
              ? 0
              : data.next;

        this.currentGifs.addObjects(images);
      } catch (error) {
        this.dialog.alert({ message: error });
      } finally {
        this.loading = false;
      }
    }
  }

  getEndpoint(query, offset) {
    if (settings.api_provider === "tenor") {
      let params = {
        key: settings.tenor_api_key,
        q: query,
        country: settings.tenor_country,
        locale: settings.tenor_locale,
        contentfilter: settings.tenor_content_filter,
        media_filter: settings.tenor_file_detail,
        limit: 24,
        pos: offset,
      };

      // Optional Parameter
      if (settings.tenor_client_key !== "") {
        params.client_key = settings.tenor_client_key;
      }

      // Include tinygif for preview and "preview" for backup.
      params.media_filter +=
        settings.tenor_file_detail !== "tinygif"
          ? ",tinygif,preview"
          : ",preview";

      return (
        "https://tenor.googleapis.com/v2/search?" + new URLSearchParams(params)
      );
    } else {
      // GIPHY
      return (
        "https://api.giphy.com/v1/gifs/search?" +
        new URLSearchParams({
          limit: 24,
          q: query,
          offset,
          api_key: settings.giphy_api_key,
          lang: settings.giphy_locale,
          rating: settings.giphy_content_rating,
        })
      );
    }
  }

  <template>
    <DModal
      @title={{i18n (themePrefix "gif.modal_title")}}
      @closeModal={{@closeModal}}
      id="gif-modal"
      class="gif-modal"
    >
      <:body>
        <div class="gif-input">
          <Input {{on "input" this.refresh}} @type="text" name="query" />

          {{#if this.loading}}
            {{loadingSpinner size="small"}}
          {{/if}}
        </div>

        {{#if this.currentGifs}}
          <div class="gif-content">
            <div class="gif-box">
              <GifResultList
                @content={{this.currentGifs}}
                @pick={{this.pick}}
                @loadMore={{this.loadMore}}
              />
            </div>
          </div>
        {{else}}
          <div class="gif-no-results">{{i18n
              (themePrefix "gif.no_results")
            }}</div>
        {{/if}}
      </:body>

      <:footer>
        <img src={{this.providerLogo}} />
      </:footer>
    </DModal>
  </template>
}
