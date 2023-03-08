const checkbox = document.querySelector('input[class="checkbox"]');

checkbox.addEventListener("change", function (e) {
  const isChecked = e.target.checked;
  if (isChecked) chrome.runtime.sendMessage("hide-ml-address");
  else chrome.runtime.sendMessage("show-ml-address");
});

chrome.runtime.sendMessage("get-hide-ml-address", function (response) {
  if (chrome.runtime.lastError) {
    checkbox.checked = true;
    return;
  }
  if (response === "true") checkbox.checked = true;
  else checkbox.checked = false;
});
