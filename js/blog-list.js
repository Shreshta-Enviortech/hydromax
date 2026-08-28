/**
 * blog-list.js — public blog listing.
 * Reads published posts only (enforced by RLS, not just by this query).
 */
(function () {
  'use strict';

  var grid    = document.getElementById('grid');
  var search  = document.getElementById('search');
  var toolbar = document.getElementById('toolbar');
  var posts   = [];
  var activeCat = '';

  function card(p) {
    var thumb = p.featured_image_url
      ? '<div class="blog-card-thumb"><img src="' + HM.esc(p.featured_image_url) +
        '" alt="' + HM.esc(p.title) + '" loading="lazy"></div>'
      : '<div class="blog-card-thumb is-empty">Hydromax</div>';

    var meta = [];
    if (p.category) meta.push('<span class="blog-card-cat">' + HM.esc(p.category) + '</span>');
    if (p.publish_date) meta.push('<span>' + HM.formatDate(p.publish_date) + '</span>');
    if (p.read_time_minutes) meta.push('<span>' + p.read_time_minutes + ' min read</span>');

    return '<a class="blog-card" href="blog-post.html?slug=' + encodeURIComponent(p.slug) + '">' +
      thumb +
      '<div class="blog-card-meta">' + meta.join('<span class="blog-card-dot">·</span>') + '</div>' +
      '<h2 class="blog-card-title">' + HM.esc(p.title) + '</h2>' +
      (p.excerpt ? '<p class="blog-card-excerpt">' + HM.esc(p.excerpt) + '</p>' : '') +
    '</a>';
  }

  function render() {
    var q = (search.value || '').trim().toLowerCase();
    var list = posts.filter(function (p) {
      if (activeCat && p.category !== activeCat) return false;
      if (!q) return true;
      return [p.title, p.excerpt, p.category]
        .some(function (f) { return String(f || '').toLowerCase().indexOf(q) !== -1; });
    });

    grid.innerHTML = list.length
      ? list.map(card).join('')
      : '<div class="blog-empty">No articles found' + (q ? ' for “' + HM.esc(q) + '”.' : '.') + '</div>';
  }

  function buildCategories() {
    var seen = {};
    posts.forEach(function (p) { if (p.category) seen[p.category] = 1; });
    var cats = Object.keys(seen).sort();
    cats.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'blog-cat';
      b.setAttribute('data-cat', c);
      b.textContent = c;
      toolbar.insertBefore(b, search);
    });
  }

  toolbar.addEventListener('click', function (e) {
    var b = e.target.closest('.blog-cat');
    if (!b) return;
    activeCat = b.getAttribute('data-cat') || '';
    toolbar.querySelectorAll('.blog-cat').forEach(function (x) { x.classList.remove('is-active'); });
    b.classList.add('is-active');
    render();
  });

  search.addEventListener('input', render);

  (async function load() {
    var res = await HM.db.from('blog_posts')
      .select('title,slug,excerpt,category,featured_image_url,publish_date,read_time_minutes')
      .eq('status', 'published')
      .order('publish_date', { ascending: false, nullsFirst: false });

    if (res.error) {
      grid.innerHTML = '<div class="blog-empty">Could not load articles right now. Please try again later.</div>';
      console.error('[blog]', res.error);
      return;
    }
    posts = res.data || [];
    if (!posts.length) {
      grid.innerHTML = '<div class="blog-empty">No articles published yet. Check back soon.</div>';
      return;
    }
    buildCategories();
    render();
  })();
})();
