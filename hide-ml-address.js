const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (
        typeof node.className === "string" &&
        node.className.includes("nav-menu-link-cp")
      ) {
        node.textContent = "***************";
      }
    });
  });
});

observer.observe(document, {
  childList: true, // watch for changes to the child nodes
  subtree: true, // watch for changes in all descendants of the body
});
