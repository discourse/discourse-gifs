import { click, fillIn, visit, waitFor } from "@ember/test-helpers";
import { test } from "qunit";
import pretender, { response } from "discourse/tests/helpers/create-pretender";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("Discourse Gifs | mobile", function (needs) {
  needs.user();
  needs.mobileView();

  test("works", async function (assert) {
    settings.giphy_api_key = "foobar";
    settings.giphy_size_variant = "original";
    pretender.get("https://api.giphy.com/v1/gifs/search", (request) => {
      assert.strictEqual(request.queryParams.api_key, "foobar");
      assert.strictEqual(request.queryParams.q, "cat");
      assert.step("api request");
      return response({
        data: [
          {
            title: "A cat",
            images: {
              fixed_width: {
                webp: "url-a",
                height: 65,
                width: 115,
              },
              original: {
                webp: "url-b",
                height: 65,
                width: 115,
              },
            },
          },
        ],
        pagination: {
          offset: 0,
          count: 1,
        },
      });
    });

    await visit("/");
    await click("#create-topic");

    await click(".mobile-gif-insert");
    assert.dom(".gif-modal").exists();

    await fillIn(".gif-input input", "cat");
    await waitFor(".gif-result-list");

    assert.dom(".gif-img").exists({ count: 1 });
    assert.dom(".gif-img").hasAttribute("height", "65");
    assert.dom(".gif-img").hasAttribute("width", "115");

    // TODO: doesn't work - composer:insert-text app event does not focus the composer
    // so the text is inserted into modal's input field, triggering another search instead
    // await click(".gif-imgwrap");
    // assert.dom(".d-editor-input").hasValue("![A cat|115x65](url-b)");

    assert.verifySteps(["api request"]);
  });
});
