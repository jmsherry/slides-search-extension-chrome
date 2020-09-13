// Method: https://www.bennettnotes.com/post/fix-receiving-end-does-not-exist/

function addHighlights(string, term) {
  return string.replaceAll(new RegExp(term, "gi"), function (originalTerm) {
    // console.log('args', arguments);
    return `<mark class="added">${originalTerm}</mark>`;
  });
}

function removeHighlights(string) {
  return string.replaceAll(
    new RegExp('<mark class="added">(.*?)</mark>', "gi"),
    function (result, cg1) {
      // console.log("args", arguments);
      return cg1;
    }
  );
}

chrome.storage.sync.get(["debug", "highlightMatches"], function ({
  debug,
  highlightMatches,
}) {
  if (highlightMatches) {
    window.addEventListener(
      "hashchange",
      () => {
        const currentSlide = document.querySelector(
          "section.present:not(.stack)"
        );
        chrome.storage.sync.get(["searchTerm"], function ({ searchTerm }) {
          currentSlide.innerHTML = addHighlights(
            currentSlide.innerHTML,
            searchTerm
          );
        });
      },
      false
    );
  }
  const noop = () => {};
  const _logger = debug ? console : { log: noop, error: noop, warn: noop };
  chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message) => {
      switch (message.type) {
        case "searchTerm":
          const stacks = Array.from(document.querySelector(".slides").children);
          const stem = window.location.href.split("#")[0];
          const regex = new RegExp(message.searchTerm, "i");
          const results = [];
          for (const [i, stack] of stacks.entries()) {
            const slides = Array.from(stack.children);
            for (const [j, slide] of slides.entries()) {
              if (regex.test(slide.textContent)) {
                results.push(
                  `${stem}#${slides.length ? `/${i}/${j}` : `/${i}`}`
                );
              }
            }
          }
          _logger.log("results", results);
          port.postMessage({
            type: "results",
            payload: results,
            contentPageURL: window.location.href,
          });
          break;
        case "navigate":
          window.location.hash = message.hash;
          break;
        case "highlight": {
          const currentSlide = document.querySelector(
            "section.present:not(.stack)"
          );
          currentSlide.innerHTML = addHighlights(
            currentSlide.innerHTML,
            message.searchTerm
          );
          break;
        }
        case "unhighlight": {
          const currentSlide = document.querySelector(
            "section.present:not(.stack)"
          );
          currentSlide.innerHTML = removeHighlights(currentSlide.innerHTML);
          break;
        }
      }
    });
  });
});
