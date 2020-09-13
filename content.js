// Method: https://www.bennettnotes.com/post/fix-receiving-end-does-not-exist/

chrome.storage.sync.get(["debug"], function ({ debug }) {
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
      }
    });
  });
});
