const searchForm = document.forms["search"];
const searchBox = document.getElementById("searchTerm");
const resultsList = document.getElementById("resultsList");
const messagesList = document.getElementById("messages");
const connectionWarning = document.getElementById("connection-warning");

let port = null;

function switchActive(target) {
  const activeItem = resultsList.querySelector(".active");
  activeItem && activeItem.classList.remove("active");
  target.closest("li").classList.add("active");
}

function connect() {
  chrome.storage.sync.get(["debug"], function ({ debug }) {
    const noop = () => {};
    const _logger = debug ? console : { log: noop, error: noop, warn: noop };
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      port = chrome.tabs.connect(tabs[0].id);
      searchForm.setAttribute("disabled", "");
      connectionWarning.remove();
      port.onMessage.addListener((message) => {
        switch (message.type) {
          case "results":
            const results = message.payload;
            if (!results.length) {
              resultsList.innerHTML = "<li>No results found</li>";
              break;
            }
            const frag = document.createDocumentFragment();
            for (const result of results) {
              const li = document.createElement("li");
              li.classList.add("list-group-item");
              if (result === message.contentPageURL) {
                li.classList.add("active");
              }
              const anchor = document.createElement("a");
              anchor.href = result;

              const hash = result.split("#")[1];
              const [empty, track, slide] = hash.split("/");
              const span = document.createElement("span");
              span.textContent = `Track ${track}, slide ${slide}`;
              anchor.append(span);

              anchor.onclick = function (e) {
                e.preventDefault();
                switchActive(this.closest("li"));
                port.postMessage({
                  type: "navigate",
                  hash,
                });
                // _logger.log(window.location);
              };
              li.append(anchor);

              const removeButton = document.createElement("button");
              removeButton.classList.add("btn", "btn-danger", "delete");
              removeButton.innerHTML =
                '<span class="sr-only">Remove Item from List</span><span aria-hidden>&times;</span>';
              removeButton.onclick = function (e) {
                e.target.closest("li").remove();
              };
              li.append(removeButton);

              frag.append(li);
            }
            resultsList.innerHTML = "";
            resultsList.append(frag);
            break;
        }
      });
    });
  });
}

window.addEventListener("load", (event) => {
  chrome.tabs.executeScript(null, { file: "content.js" }, () => {
    connect(); //this is where I call my function to establish a connection
    chrome.storage.sync.get(
      ["searchTerm", "darkMode", "highlightMatches"],
      function ({ searchTerm, darkMode, highlightMatches }) {
        searchBox.value = searchTerm || "";
        if (darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }

        if (highlightMatches) {
          const removeHighlightButton = document.createElement("button");
          removeHighlightButton.classList.add(
            "btn",
            "btn-info",
            "btn-block"
          );
          removeHighlightButton.textContent = "Clear Highlighting";
          removeHighlightButton.onclick = function (e) {
            port.postMessage({
              type: "unhighlight",
            });
          };
          resultsList.after(removeHighlightButton);
        }
      }
    );
  });
});

searchForm.addEventListener("submit", function (e) {
  const searchTerm = searchBox.value;
  e.preventDefault();
  port.postMessage({
    type: "searchTerm",
    searchTerm,
  });
  chrome.storage.sync.set({ searchTerm });
});
