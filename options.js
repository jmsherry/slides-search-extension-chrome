const debugCheckbox = document.getElementById("debug");
const debugModeDisplay = document.getElementById("debug-mode-display");
const highlightMatchesCheckbox = document.getElementById("highlight-matches");
const highlightMatchesDisplay = document.getElementById("highlight-matches-display");
const darkModeCheckbox = document.getElementById("dark-mode");
const darkModeDisplay = document.getElementById(
  "dark-mode-display"
);

chrome.storage.sync.get(["debug", "highlightMatches", "darkMode"], function ({ debug, highlightMatches, darkMode }) {
  debugCheckbox.checked = debug;
  debugModeDisplay.textContent = debug ? "on" : "off";
  highlightMatchesCheckbox.checked = highlightMatches;
  highlightMatchesDisplay.textContent = highlightMatches ? "on" : "off";
  darkModeCheckbox.checked = darkMode;
  darkModeDisplay.textContent = darkMode ? "on" : "off";
});

debugCheckbox.addEventListener('change', (e) => {
  chrome.storage.sync.set({ debug: e.target.checked });
  debugModeDisplay.textContent = e.target.checked ? 'on' : 'off';
});

highlightMatchesCheckbox.addEventListener("change", (e) => {
  chrome.storage.sync.set({ highlightMatches: e.target.checked });
  highlightMatchesDisplay.textContent = e.target.checked ? "on" : "off";
});

darkModeCheckbox.addEventListener("change", (e) => {
  chrome.storage.sync.set({ darkMode: e.target.checked });
  darkModeDisplay.textContent = e.target.checked ? "on" : "off";
});
