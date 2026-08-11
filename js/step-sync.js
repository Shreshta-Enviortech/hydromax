/**
 * step-sync.js
 * Replaces Webflow's 4-step scroll animation with a 7-step version.
 *
 * Strategy: run a permanent requestAnimationFrame loop that fires
 * AFTER Webflow's own rAF callbacks (because this script loads last).
 * Each frame we directly overwrite the inline bg-color Webflow set,
 * so there is never any flicker.
 *
 * Step detection: a step is "active/past" when its card top has
 * crossed 65% down the viewport. We track the highest such index.
 */
(function () {
  'use strict';

  var SUFFIXES = ['_1st', '_2nd', '_3rd', '_4rd', '_5th', '_6th', '_7th'];

  /* Colours matching the Webflow CSS variables */
  var C_DARK   = 'rgb(1, 1, 1)';      /* --dark--100  */
  var C_LIGHT  = 'rgb(234, 234, 234)'; /* --white--400 */
  var C_WHITE  = 'rgb(255, 255, 255)'; /* --white--100 */
  var C_GRAY   = 'rgb(74, 74, 74)';   /* --gray--100  */

  /* Shared state */
  var currentActive = 0;

  function init() {
    var stepArea = document.querySelector('.step-area');
    if (!stepArea) return; /* not on a page with steps */

    var cards  = SUFFIXES.map(function (s) {
      return stepArea.querySelector('.step-card' + s);
    }).filter(Boolean);

    var points = SUFFIXES.map(function (s) {
      return stepArea.querySelector('.step-point' + s);
    }).filter(Boolean);

    var lineBar = stepArea.querySelector('.step-line-bar');
    var n = Math.min(cards.length, points.length);
    if (!n) return;

    /* Pre-cache .step-count children so we don't query every frame */
    var counts = points.map(function (pt) {
      return pt.querySelector('.step-count');
    });

    /* ── Scroll detection ─────────────────────────────────── */
    function detectActive() {
      var vh        = window.innerHeight;
      var threshold = vh * 0.65; /* card top above this → it's "reached" */
      var active    = 0;
      for (var i = 0; i < cards.length; i++) {
        if (cards[i].getBoundingClientRect().top < threshold) {
          active = i;
        }
      }
      currentActive = active;
    }

    window.addEventListener('scroll', detectActive, { passive: true });
    window.addEventListener('resize', detectActive, { passive: true });
    detectActive(); /* initial value */

    /* ── Permanent rAF loop – fires every frame after Webflow ─ */
    function applyStyles() {
      for (var i = 0; i < points.length; i++) {
        var on = (i <= currentActive);
        points[i].style.backgroundColor = on ? C_DARK  : C_LIGHT;
        if (counts[i]) counts[i].style.color = on ? C_WHITE : C_GRAY;
      }

      /* Animate the progress line */
      if (lineBar) {
        var pct = n > 1 ? (currentActive / (n - 1)) * 100 : 100;
        lineBar.style.transform = 'translateY(' + (pct - 100) + '%)';
      }

      requestAnimationFrame(applyStyles); /* schedule next frame */
    }

    requestAnimationFrame(applyStyles);   /* kick off the loop   */
  }

  /* Start after DOM + Webflow JS are both done */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 50);
  }
})();
