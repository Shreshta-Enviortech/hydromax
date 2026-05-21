(function () {
  function initOffcanvas() {
    var offcanvas = document.querySelector(".offcanvas-main");
    var closeBtn =
      document.querySelector(".offcanvas-close-btn") ||
      document.querySelector(".close-icon");
    if (!offcanvas || !closeBtn) return;

    function closeMenu() {
      offcanvas.style.display = "none";
      offcanvas.style.transform = "";
      var nav = offcanvas.querySelector(".offcanvas-nav");
      if (nav) {
        nav.style.opacity = "";
        nav.style.transform = "";
      }
      document.body.style.overflow = "";
    }

    closeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
  }

  initOffcanvas();

  var megaItem = document.querySelector(".nav-item-mega");
  if (!megaItem) return;

  var trigger = megaItem.querySelector(".nav-mega-trigger");
  var dropdown = megaItem.querySelector(".mega-dropdown");
  if (!trigger || !dropdown) return;

  var links = dropdown.querySelectorAll(".mega-product-link");
  var previewImg = dropdown.querySelector(".mega-preview-image");
  var closeTimer = null;
  var CLOSE_DELAY = 300;

  function setOpen(open) {
    megaItem.classList.toggle("is-mega-open", open);
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    dropdown.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function clearTimers() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function openMenu() {
    clearTimers();
    setOpen(true);
  }

  function scheduleClose() {
    clearTimers();
    closeTimer = window.setTimeout(function () {
      setOpen(false);
    }, CLOSE_DELAY);
  }

  function isInHoverZone(target) {
    if (!target) return false;
    return trigger.contains(target) || dropdown.contains(target);
  }

  function setPreview(src, alt) {
    if (!previewImg || !src) return;
    previewImg.classList.add("is-fading");
    window.setTimeout(function () {
      previewImg.src = src;
      previewImg.alt = alt || "";
      previewImg.classList.remove("is-fading");
    }, 120);
  }

  if (links.length && previewImg) {
    links.forEach(function (link) {
      function activate() {
        links.forEach(function (l) {
          l.classList.remove("is-active");
        });
        link.classList.add("is-active");
        setPreview(
          link.getAttribute("data-preview"),
          link.getAttribute("data-preview-alt")
        );
      }

      link.addEventListener("mouseenter", activate);
      link.addEventListener("focus", activate);
    });

    links[0].classList.add("is-active");
  }

  trigger.addEventListener("mouseenter", openMenu);
  dropdown.addEventListener("mouseenter", openMenu);

  trigger.addEventListener("mouseleave", function (e) {
    if (isInHoverZone(e.relatedTarget)) return;
    scheduleClose();
  });

  dropdown.addEventListener("mouseleave", function (e) {
    if (isInHoverZone(e.relatedTarget)) return;
    scheduleClose();
  });

  megaItem.addEventListener("focusin", function (e) {
    if (isInHoverZone(e.target)) openMenu();
  });

  megaItem.addEventListener("focusout", function (e) {
    if (isInHoverZone(e.relatedTarget)) return;
    scheduleClose();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      clearTimers();
      setOpen(false);
      trigger.focus();
    }
  });

  var mobileToggle = document.querySelector(".offcanvas-products-toggle");
  var mobileMenu = document.getElementById("offcanvas-products-menu");

  if (mobileToggle && mobileMenu) {
    mobileMenu.setAttribute("hidden", "");

    mobileToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var isOpen = mobileToggle.getAttribute("aria-expanded") === "true";
      mobileToggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
      if (isOpen) {
        mobileMenu.setAttribute("hidden", "");
        mobileMenu.classList.remove("is-open");
      } else {
        mobileMenu.removeAttribute("hidden");
        mobileMenu.classList.add("is-open");
      }
    });
  }
})();
