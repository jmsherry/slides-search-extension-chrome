const debugCheckbox = document.getElementById("debug");
chrome.storage.sync.get(["debug"], function ({ debug }) {
  debugCheckbox.checked = debug;
});
debugCheckbox.addEventListener('change', (e) => {
  chrome.storage.sync.set({ debug: e.target.checked });
});
