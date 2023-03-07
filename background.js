const sendTabsMessage = (message) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    try {
      chrome.tabs.sendMessage(tabs[0].id, message);
    } catch (e) {
      console.log(e);
    }
  });
};

const setStorage = (value) => {
  chrome.storage.sync.set({ "hide-ml-address": value }, () => {
    console.log("Set hide ML Address storage to ", value);
  });
  sendTabsMessage(value === "true" ? "hide-ml-address" : "show-ml-address");
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
    if (request === "hide-ml-address") setStorage("true");
    if (request === "show-ml-address") setStorage("false");
    if (request === "get-hide-ml-address") {
      chrome.storage.sync.get("hide-ml-address", function (items) {
        const response = items["hide-ml-address"] || "true";
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }
        sendResponse(response);
      });

      return true;
    }
    return false;
  });
});
