let hideMLAddress = true;
const modifiedNodes = [];
const originalInnerHTMLByNode = new Map();

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
  if (chrome.runtime.lastError) {
    hideMLAddress = true;
    notifyNodes();
    return;
  }

  if (response === "true") hideMLAddress = true;
  else hideMLAddress = false;
  notifyNodes();
});

chrome.runtime.onMessage.addListener(function (message) {
  if (message === "hide-ml-address") hideMLAddress = true;
  if (message === "show-ml-address") hideMLAddress = false;

  notifyNodes();
});

const setNodeTextContent = (node, flag) => {
  if (flag) node.textContent = "***************";
  else node.innerHTML = originalInnerHTMLByNode.get(node);
};

const nodeListener = (e) => {
  e.stopPropagation();
  e.preventDefault();
  alert(
    "No puedes cambiar tu dirección de envío, desactiva la extension de proteccion de direccion de Mercado Libre"
  );
};

const setEventListenerToNode = (node, flag) => {
  if (flag) {
    node.addEventListener("click", nodeListener);
    node.href = "javascript:void(0)";
  } else {
    node.removeEventListener("click", nodeListener);
    node.href = originalInnerHTMLByNode.get(node);
  }
};

const trackNode = (node) => {
  if (modifiedNodes.includes(node)) return;
  modifiedNodes.push(node);
  originalInnerHTMLByNode.set(node, node.innerHTML);
  setNodeTextContent(node, hideMLAddress);
  node.addEventListener("changed-hide-ml-address", (e) => {
    const { hideMLAddress } = e.detail;
    setNodeTextContent(node, hideMLAddress);
  });
};

const disableNodeFunctionality = (node) => {
  if (modifiedNodes.includes(node)) return;
  modifiedNodes.push(node);

  originalInnerHTMLByNode.set(node, node.href);
  setEventListenerToNode(node, hideMLAddress);

  node.addEventListener("changed-hide-ml-address", (e) => {
    const { hideMLAddress } = e.detail;
    setEventListenerToNode(node, hideMLAddress);
  });
};

const nodeClassNameContains = (node, className) =>
  node.nodeType === Node.ELEMENT_NODE &&
  typeof node.className === "string" &&
  node.className.includes(className);

const isMLChangeAddressButton = (node) =>
  nodeClassNameContains(node, "nav-menu-cp nav-menu-cp-logged") ||
  nodeClassNameContains(node, "nav-header-cp-anchor") ||
  nodeClassNameContains(node, "ui-pdp-action-modal");

const clearNavbarMLAddress = (node) => {
  if (nodeClassNameContains(node, "nav-menu-link-cp")) trackNode(node);
};

const clearNodesByClassName = (node, className) => {
  const nodes = node.querySelectorAll?.(`[class*="${className}"]`);
  if (nodes) {
    nodes.forEach((specificNode) => {
      trackNode(specificNode);
    });
  }
};

const clearInnerAddresses = (node) => {
  clearNodesByClassName(node, "card-block__text--addresses");
};

const clearSendToMLAddress = (node) => {
  clearNodesByClassName(node, "ui-pdp-action-modal");
};

const observeElement = (document) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        clearNavbarMLAddress(node);
        clearInnerAddresses(node);
        clearSendToMLAddress(node);

        if (isMLChangeAddressButton(node)) disableNodeFunctionality(node);
      });
    });
  });

  observer.observe(document, {
    childList: true, // watch for changes to the child nodes
    subtree: true, // watch for changes in all descendants of the body
  });
};

observeElement(document);
