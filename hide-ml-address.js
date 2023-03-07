let hideMLAddress = true;
const modifiedNodes = [];

const notifyNodes = () => {
  const customEvent = new CustomEvent("changed-hide-ml-address", {
    bubbles: false,
    detail: {
      hideMLAddress,
    },
  });

  modifiedNodes.forEach((node) => {
    node.dispatchEvent(customEvent);
  });
};

chrome.runtime.sendMessage("get-hide-ml-address", function (response) {
  if (response === "true") hideMLAddress = true;
  else hideMLAddress = false;

  notifyNodes();
});

chrome.runtime.onMessage.addListener(function (message) {
  console.log("Message received in content script:", message);
  if (message === "hide-ml-address") hideMLAddress = true;
  if (message === "show-ml-address") hideMLAddress = false;

  notifyNodes();
});

const setNodeTextContent = (node, flag) => {
  if (flag) node.textContent = "***************";
  else node.textContent = "asdasdsad" || node.dataset.originalText;
};

const trackNode = (node) => {
  if (modifiedNodes.includes(node)) return;
  modifiedNodes.push(node);
  setNodeTextContent(node, hideMLAddress);
  node.addEventListener("changed-hide-ml-address", (e) => {
    const { hideMLAddress } = e.detail;
    setNodeTextContent(node, hideMLAddress);
  });
};

const nodeClassNameContains = (node, className) =>
  node.nodeType === Node.ELEMENT_NODE &&
  typeof node.className === "string" &&
  node.className.includes(className);

const isMLChangeAddressButton = (node) =>
  nodeClassNameContains(node, "nav-menu-cp nav-menu-cp-logged");

const clearNavbarMLAddress = (node) => {
  if (nodeClassNameContains(node, "nav-menu-link-cp")) trackNode(node);
};

const clearInnerAddresses = (node) => {
  const innerAddresses = node.querySelectorAll?.(
    '[class*="card-block__text--addresses"]'
  );
  if (innerAddresses) {
    innerAddresses.forEach((addressNode) => {
      trackNode(addressNode);
    });
  }
};

const clearPersonalDataProfile = (node) => {
  const personalDataProfiles = node.querySelectorAll?.(
    '[class*="main-container profile"]'
  );

  if (personalDataProfiles) {
    personalDataProfiles.forEach((profile) => {
      trackNode(profile);
    });
  }
};

const observeElement = (document) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        clearNavbarMLAddress(node);
        clearInnerAddresses(node);
        clearPersonalDataProfile(node);

        if (isMLChangeAddressButton(node)) {
          const changeAddressButton = node;

          changeAddressButton.href = "javascript:void(0)";
          changeAddressButton.addEventListener("click", (e) => {
            e.stopPropagation();
            alert(
              "No puedes cambiar tu dirección de envío, desactiva la extension de proteccion de direccion de Mercado Libre"
            );
          });
        }
      });
    });
  });

  observer.observe(document, {
    childList: true, // watch for changes to the child nodes
    subtree: true, // watch for changes in all descendants of the body
  });
};

observeElement(document);
