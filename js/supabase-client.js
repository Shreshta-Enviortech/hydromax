/**
 * supabase-client.js
 * Shared Supabase client + helpers for the Hydromax site and admin.
 *
 * Load AFTER the Supabase UMD bundle:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="js/supabase-client.js"></script>
 *
 * The publishable key below is safe to ship in client-side code — it is
 * designed to be public. Row Level Security (see supabase/schema.sql) is what
 * actually protects the data. NEVER put the sb_secret_... key in this file.
 */
(function (window) {
  'use strict';

  var SUPABASE_URL = 'https://hlbwwsnxvmmvgamrdzdw.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_Mxm2c1aTZ0WYZ_nf_8PhnQ_2zCt8Yfq';

  var BUCKET = 'blog-media';

  if (!window.supabase || !window.supabase.createClient) {
    console.error('[hydromax] Supabase library not loaded. Add the CDN script before this file.');
    return;
  }

  var db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  /* ── Auth ──────────────────────────────────────────────────────────── */

  async function getSession() {
    var res = await db.auth.getSession();
    return res.data ? res.data.session : null;
  }

  async function signIn(email, password) {
    return db.auth.signInWithPassword({ email: email, password: password });
  }

  async function signOut() {
    await db.auth.signOut();
    window.location.href = 'login.html';
  }

  /**
   * Drop-in guard for every admin page.
   * Redirects to login.html when there is no active session.
   * Returns the session when there is one.
   */
  async function requireAuth() {
    var session = await getSession();
    if (!session) {
      var here = window.location.pathname.split('/').pop() || '';
      window.location.replace('login.html?next=' + encodeURIComponent(here));
      return null;
    }
    return session;
  }

  /* ── Storage ───────────────────────────────────────────────────────── */

  /** Upload a File to the blog-media bucket, return its public URL. */
  async function uploadImage(file) {
    var ext  = (file.name.split('.').pop() || 'jpg').toLowerCase();
    var safe = file.name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'image';
    var path = safe + '-' + Date.now() + '.' + ext;

    var up = await db.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (up.error) throw up.error;

    var pub = db.storage.from(BUCKET).getPublicUrl(path);
    return pub.data.publicUrl;
  }

  async function listImages() {
    var res = await db.storage.from(BUCKET).list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    });
    if (res.error) throw res.error;
    return (res.data || [])
      .filter(function (f) { return f.id; })
      .map(function (f) {
        return {
          name: f.name,
          url: db.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl
        };
      });
  }

  async function deleteImage(name) {
    var res = await db.storage.from(BUCKET).remove([name]);
    if (res.error) throw res.error;
  }

  /* ── Utilities ─────────────────────────────────────────────────────── */

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /** Rough read-time estimate at 200 words/minute. */
  function readTime(content) {
    var words = String(content || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }

  function formatDate(value) {
    if (!value) return '';
    var d = new Date(value);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  /** Escape text before putting it into HTML. */
  function esc(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Render post content, honouring content_format, sanitised when possible. */
  function renderContent(content, format) {
    var html;
    if (format === 'html') {
      html = content || '';
    } else if (window.marked) {
      html = window.marked.parse(content || '');
    } else {
      html = '<p>' + esc(content).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
    }
    if (window.DOMPurify) html = window.DOMPurify.sanitize(html);
    return html;
  }

  function toast(message, isError) {
    var el = document.createElement('div');
    el.className = 'hm-toast' + (isError ? ' is-error' : '');
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add('is-visible'); }, 10);
    setTimeout(function () {
      el.classList.remove('is-visible');
      setTimeout(function () { el.remove(); }, 300);
    }, 3200);
  }

  window.HM = {
    db: db,
    BUCKET: BUCKET,
    getSession: getSession,
    signIn: signIn,
    signOut: signOut,
    requireAuth: requireAuth,
    uploadImage: uploadImage,
    listImages: listImages,
    deleteImage: deleteImage,
    slugify: slugify,
    readTime: readTime,
    formatDate: formatDate,
    esc: esc,
    renderContent: renderContent,
    toast: toast
  };
})(window);
