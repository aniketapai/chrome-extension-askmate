chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["geminiApiKey"], (result) => {
    if (!result.geminiApiKey) {
      chrome.tabs.create({ url: "options.html" });
    }
  });
  // local and sync exist
  // local stores it in your current browser but sync will make it sync across all chrome sessions(Multiple chrome accounts)
});
