/**
 * blog-post.js — single article page, keyed off ?slug=
 * Also sets the document title and SEO meta tags from the post record.
 */
(function () {
  'use strict';

  var box  = document.getElementById('article');
  var slug = new URLSearchParams(window.location.search).get('slug');

  function notFound(message) {
    box.innerHTML =
      '<a class="article-back" href="blog.html">&#8592; Back to insights</a>' +
      '<h1 class="article-title">Article not found</h1>' +
      '<p class="article-excerpt">' + HM.esc(message ||
        'This article may have been moved or unpublished.') + '</p>' +
      '<a class="btn-secondary w-inline-block" href="blog.html" style="margin-top:12px">' +
      '<div>Browse all articles</div></a>';
  }

  function setMeta(name, content, isProperty) {
    if (!content) return;
    var attr = isProperty ? 'property' : 'name';
    var el = document.head.querySelector('meta[' + attr + '="' + name + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  if (!slug) { notFound('No article was specified.'); return; }

  (async function load() {
    var res = await HM.db.from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (res.error) { notFound('Could not load this article right now.'); console.error('[blog]', res.error); return; }
    if (!res.data)  { notFound(); return; }

    var p = res.data;

    /* Head / SEO */
    document.title = (p.seo_title || p.title) + ' | Hydromax';
    setMeta('description', p.seo_description || p.excerpt || '');
    setMeta('og:title', p.seo_title || p.title, true);
    setMeta('og:description', p.seo_description || p.excerpt || '', true);
    setMeta('og:type', 'article', true);
    if (p.featured_image_url) setMeta('og:image', p.featured_image_url, true);

    /* Body */
    var meta = [];
    if (p.category) meta.push('<span class="article-cat">' + HM.esc(p.category) + '</span>');
    if (p.publish_date) meta.push('<span>' + HM.formatDate(p.publish_date) + '</span>');
    if (p.read_time_minutes) meta.push('<span>' + p.read_time_minutes + ' min read</span>');

    var author = '';
    if (p.author_name) {
      author = '<div class="article-author">' +
        '<span class="article-author-name">' + HM.esc(p.author_name) + '</span>' +
        (p.author_role ? '<span class="article-author-role">' + HM.esc(p.author_role) + '</span>' : '') +
      '</div>';
    }

    box.innerHTML =
      '<a class="article-back" href="blog.html">&#8592; Back to insights</a>' +
      '<div class="article-meta">' + meta.join('<span class="blog-card-dot">·</span>') + '</div>' +
      '<h1 class="article-title">' + HM.esc(p.title) + '</h1>' +
      (p.excerpt ? '<p class="article-excerpt">' + HM.esc(p.excerpt) + '</p>' : '') +
      author +
      (p.featured_image_url
        ? '<img class="article-hero" src="' + HM.esc(p.featured_image_url) +
          '" alt="' + HM.esc(p.title) + '">'
        : '') +
      '<div class="article-body">' + HM.renderContent(p.content, p.content_format) + '</div>';
  })();
})();
