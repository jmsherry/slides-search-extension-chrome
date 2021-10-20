function load() {
  chrome.declarativeContent.onPageChanged.addRules([
    {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostEquals: "slides.com" },
        }),
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()],
    },
  ]);
}

chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, load);
});

// chrome.runtime.onDisconnect.addListener(function () {
//   console.log('disconnected. Reconnecting...');
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, load);
// });
