const sendMessage = (message, callback) => {
  if (callback) chrome.runtime.sendMessage(message, callback);
  else chrome.runtime.sendMessage(message);
};

const checkbox = document.querySelector('input[class="checkbox"]');

checkbox.addEventListener("change", function (e) {
  const isChecked = e.target.checked;
  if (isChecked) sendMessage("hide-ml-address");
  else sendMessage("show-ml-address");
});

sendMessage("get-hide-ml-address", function (response) {
  if (chrome.runtime.lastError) {
    checkbox.checked = true;
    return;
  }
  if (response === "true") checkbox.checked = true;
  else checkbox.checked = false;
});
