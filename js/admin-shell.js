/**
 * admin-shell.js
 * Renders the shared admin sidebar + topbar, and enforces the auth guard.
 *
 * Each admin page supplies:
 *   <body class="admin" data-page="posts" data-title="Blog posts">
 * and an empty <div id="ad-root"></div> is not needed — the shell wraps
 * whatever is inside <main id="ad-content">.
 */
(function (window, document) {
  'use strict';

  var NAV = [
    { label: 'Dashboard', href: 'dashboard.html', key: 'dashboard' },
    { group: 'Content' },
    { label: 'Blog posts', href: 'posts.html', key: 'posts' },
    { group: 'CRM' },
    { label: 'Accounts',  href: 'crm.html?t=accounts', key: 'accounts' },
    { label: 'Contacts',  href: 'crm.html?t=contacts', key: 'contacts' },
    { label: 'Leads',     href: 'crm.html?t=leads',    key: 'leads' },
    { label: 'Deals',     href: 'crm.html?t=deals',    key: 'deals' },
    { label: 'Tasks',     href: 'crm.html?t=tasks',    key: 'tasks' },
    { group: 'Media' },
    { label: 'Blog media', href: 'media.html', key: 'media' }
  ];

  function buildNav(activeKey) {
    return NAV.map(function (item) {
      if (item.group) return '<div class="ad-nav-label">' + item.group + '</div>';
      var cls = item.key === activeKey ? ' class="is-active"' : '';
      return '<a href="' + item.href + '"' + cls + '>' + item.label + '</a>';
    }).join('');
  }

  async function init() {
    var session = await window.HM.requireAuth();
    if (!session) return; // redirecting

    var body    = document.body;
    var pageKey = body.getAttribute('data-page') || '';
    var title   = body.getAttribute('data-title') || 'Admin';
    var content = document.getElementById('ad-content');
    var inner   = content ? content.innerHTML : '';

    var shell =
      '<div class="ad-shell">' +
        '<aside class="ad-sidebar">' +
          '<div class="ad-brand">' +
            '<p class="ad-brand-name">Hydromax Admin</p>' +
            '<p class="ad-brand-sub">Manage content and CRM</p>' +
          '</div>' +
          '<nav class="ad-nav">' + buildNav(pageKey) + '</nav>' +
        '</aside>' +
        '<div class="ad-main">' +
          '<header class="ad-topbar">' +
            '<h1>' + window.HM.esc(title) + '</h1>' +
            '<div class="ad-topbar-right">' +
              '<span class="ad-user">' + window.HM.esc(session.user.email) + '</span>' +
              '<a href="../index.html" target="_blank" rel="noopener">View site</a>' +
              '<button class="ad-btn ad-btn-ghost ad-btn-sm" id="ad-signout">Sign out</button>' +
            '</div>' +
          '</header>' +
          '<main class="ad-content" id="ad-content">' + inner + '</main>' +
        '</div>' +
      '</div>';

    body.innerHTML = shell;
    document.getElementById('ad-signout').addEventListener('click', window.HM.signOut);

    // Let the page know the shell is ready and it may render.
    document.dispatchEvent(new CustomEvent('admin:ready', { detail: { session: session } }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
