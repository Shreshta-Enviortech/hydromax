(function () {
  var stack = document.querySelector(".pump-centrifugal-stack");
  if (!stack) return;

  var cards = stack.querySelectorAll(".pump-stack-card");
  if (!cards.length) return;

  function updateStack() {
    var activeIndex = 0;
    var viewportMid = window.innerHeight * 0.42;

    cards.forEach(function (card, index) {
      var rect = card.getBoundingClientRect();
      if (rect.top <= viewportMid && rect.bottom > viewportMid * 0.5) {
        activeIndex = index;
      }
    });

    cards.forEach(function (card, index) {
      card.classList.remove("is-active", "is-behind");
      if (index < activeIndex) {
        card.classList.add("is-behind");
      } else if (index === activeIndex) {
        card.classList.add("is-active");
      }
    });
  }

  cards[0].classList.add("is-active");

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateStack();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateStack();
})();
