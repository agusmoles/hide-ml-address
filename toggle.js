console.log("asd");

document
  .querySelector('input[class="checkbox"]')
  .addEventListener("click", function () {
    chrome.storage.sync.set({ "hide-ml-address": "true" }, () => {
      console.log("User setting saved");
    });
  });
