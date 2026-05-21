(function () {
  var root = document.querySelector(".pump-showcase");
  if (!root) return;

  var tabs = root.querySelectorAll(".pump-showcase-tab");
  var images = root.querySelectorAll(".pump-showcase-image");
  var panels = root.querySelectorAll(".pump-showcase-panel");
  if (!tabs.length) return;

  function activate(tabId) {
    tabs.forEach(function (tab) {
      var active = tab.getAttribute("data-pump-tab") === tabId;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    images.forEach(function (img) {
      img.classList.toggle("is-active", img.getAttribute("data-pump-image") === tabId);
    });

    panels.forEach(function (panel) {
      panel.classList.toggle("is-active", panel.getAttribute("data-pump-panel") === tabId);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activate(tab.getAttribute("data-pump-tab"));
    });
  });
})();
