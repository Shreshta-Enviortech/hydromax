(function () {
  var root = document.querySelector(".pump-booster");
  if (!root) return;

  var tabs = root.querySelectorAll(".pump-booster-tab");
  var panels = root.querySelectorAll(".pump-booster-panel");
  if (!tabs.length) return;

  function activate(id) {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute("data-booster-tab") === id;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });

    panels.forEach(function (panel) {
      var on = panel.getAttribute("data-booster-panel") === id;
      panel.classList.toggle("is-active", on);
      if (on) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activate(tab.getAttribute("data-booster-tab"));
    });
  });
})();
