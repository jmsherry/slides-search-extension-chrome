// Method: https://www.bennettnotes.com/post/fix-receiving-end-does-not-exist/

function walkTheDOM(node, func) {
  func(node);
  node = node.firstChild;
  while (node) {
    walkTheDOM(node, func);
    node = node.nextSibling;
  }
}

function addHighlightElement(term, node) {
  if (node.nodeType === Node.TEXT_NODE) {
    console.log("node", node.data);
    if (!node.data.includes(term)) return;
    if (node.parentNode.matches("mark.added")) return;
    console.log("hit");
    const parts = node.data.split(term);
    const lastIndex = parts.length - 1;
    const frag = document.createDocumentFragment();
    for (const [i, part] of parts.entries()) {
      frag.append(part);
      if (i < lastIndex) {
        const mark = document.createElement("mark");
        mark.classList.add("added");
        mark.textContent = term;
        frag.append(mark);
      }
    }
    node.replaceWith(frag);
  }
}

function addHighlights(slide, term) {
  walkTheDOM(slide, addHighlightElement.bind(null, term));
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

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function unhighlightSlide() {
  const currentSlide = document.querySelector("section.present:not(.stack)");
  currentSlide.innerHTML = removeHighlights(currentSlide.innerHTML);
}

function unhighlightDeck() {
  const slideTrack = document.querySelector(".slides");
  slideTrack.innerHTML = removeHighlights(slideTrack.innerHTML);
}

function highlightCurrentSlide() {
  const currentSlide = document.querySelector("section.present:not(.stack)");
  addHighlights(currentSlide, message.searchTerm);
}

chrome.storage.sync.get(
  ["debug", "highlightMatches"],
  function ({ debug, highlightMatches }) {
    if (highlightMatches) {
      window.addEventListener(
        "hashchange",
        () => {
          const currentSlide = document.querySelector(
            "section.present:not(.stack)"
          );
          console.log("currentSlide", currentSlide);
          chrome.storage.sync.get(["searchTerm"], function ({ searchTerm }) {
            addHighlights(currentSlide, searchTerm);
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
            const stacks = Array.from(
              document.querySelector(".slides").children
            );
            const stem = window.location.href.split("#")[0];
            const regex = new RegExp(escapeRegExp(message.searchTerm), "i");
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
            if (highlightMatches) {
              unhighlightDeck();
              const currentSlide = document.querySelector(
                "section.present:not(.stack)"
              );
              addHighlights(currentSlide, message.searchTerm);
            }
            break;
          case "navigate":
            const from = window.location.hash;
            const to = message.hash;
            if (from === to) {
              if (highlightMatches) {
                highlightCurrentSlide();
              }
            } else {
              window.location.hash = message.hash;
            }
            break;
          // case "highlight": {
          //   const currentSlide = document.querySelector(
          //     "section.present:not(.stack)"
          //   );
          //   addHighlights(
          //     currentSlide,
          //     message.searchTerm
          //   );
          //   break;
          // }
          case "unhighlight": {
            unhighlightSlide();
            break;
          }
          // case "unhighlightAll": {
          // unhighlightDeck();
          //   break;
          // }
        }
      });
    });
  }
);
