#!/usr/bin/env python3
"""Sync homepage-style header and footer across site HTML files."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PRODUCTS = [
    {
        "file": "pumps.html",
        "slug": "pumps",
        "title": "Water Pumps",
        "desc": "Reliable pumping for municipal and industrial water systems.",
        "preview": "images/somu40.png",
        "icon": "pump",
        "banner_mp4": "videos/hydro.mp4",
        "banner_webm": "videos/sq_webm.webm",
        "banner_poster": "videos/sq_poster.0000000.jpg",
    },
    {
        "file": "watertreatment.html",
        "slug": "watertreatment",
        "title": "Water Treatment",
        "desc": "Treatment systems built for consistent, compliant water quality.",
        "preview": "images/som34.png",
        "icon": "water",
        "banner_mp4": "videos/somu223_mp4.mp4",
        "banner_webm": "videos/somu223_webm.webm",
        "banner_poster": "videos/somu223_poster.0000000.jpg",
    },
    {
        "file": "Aeriation.html",
        "slug": "aeriation",
        "title": "Aeriations",
        "desc": "Aeration technology for efficient biological wastewater treatment.",
        "preview": "images/somu42.png",
        "icon": "aeration",
        "banner_mp4": "videos/somu3.0_mp4.mp4",
        "banner_webm": "videos/somu3.0_webm.webm",
        "banner_poster": "videos/somu3.0_poster.0000000.jpg",
    },
    {
        "file": "heatingsolution.html",
        "slug": "heatingsolution",
        "title": "Heating Solutions",
        "desc": "Thermal systems for stable process heating and energy efficiency.",
        "preview": "images/som35.png",
        "icon": "heat",
        "banner_mp4": "videos/hydro1.mp4",
        "banner_webm": "videos/sq_webm.webm",
        "banner_poster": "videos/sq_poster.0000000.jpg",
    },
    {
        "file": "Industrialchemicals.html",
        "slug": "industrialchemicals",
        "title": "Industrial Chemicals",
        "desc": "Specialty chemicals for treatment performance and plant uptime.",
        "preview": "images/som38.png",
        "icon": "chemical",
        "banner_mp4": "videos/somu223_mp4.mp4",
        "banner_webm": "videos/somu223_webm.webm",
        "banner_poster": "videos/somu223_poster.0000000.jpg",
    },
]

ICON_SVGS = {
    "pump": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 14h4v5H3zM17 5h4v5h-4z"/><path d="M7 19V9a3 3 0 013-3h4"/><path d="M14 6h3v3"/></svg>',
    "water": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.32 0z"/></svg>',
    "aeration": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2 2 0 1019 12H2"/></svg>',
    "heat": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/></svg>',
    "chemical": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6v7l5 9a2 2 0 01-1.74 3H5.74A2 2 0 014 19l5-9V3z"/><path d="M10 3h4"/></svg>',
}

ACTIVE_MAP = {
    "index.html": "home",
    "about.html": "about",
    "service.html": "service",
    "contact.html": "contact",
    "detail_service.html": "service",
    "search.html": None,
    "404.html": None,
}
for p in PRODUCTS:
    ACTIVE_MAP[p["file"]] = "products"


def current(page, link):
    if page == link:
        return ' aria-current="page"', " w--current"
    return "", ""


def products_mega_item(base: str, active: str | None) -> str:
    ac, cls = current(active, "products")
    items = []
    for product in PRODUCTS:
        icon = ICON_SVGS[product["icon"]]
        preview = f'{base}{product["preview"]}'
        items.append(
            f"""                    <li role="none">
                      <a href="{base}{product["file"]}" class="mega-product-link" role="menuitem" data-preview="{preview}" data-preview-alt="{product["title"]}">
                        <span class="mega-product-icon">{icon}</span>
                        <span class="mega-product-copy">
                          <span class="mega-product-title">{product["title"]}</span>
                          <span class="mega-product-desc">{product["desc"]}</span>
                        </span>
                      </a>
                    </li>"""
        )
    items_html = "\n".join(items)
    default_preview = f'{base}{PRODUCTS[0]["preview"]}'
    default_alt = PRODUCTS[0]["title"]
    return f"""            <li class="nav-item nav-item-mega">
              <a href="{base}pumps.html"{ac} class="nav-link nav-mega-trigger{cls}" aria-haspopup="true" aria-expanded="false">Products</a>
              <div class="mega-dropdown" role="menu" aria-label="Products" aria-hidden="true">
                <div class="mega-dropdown-panel">
                  <div class="mega-dropdown-layout">
                    <div class="mega-dropdown-col-links">
                      <ul class="mega-dropdown-list" role="none">
{items_html}
                      </ul>
                    </div>
                    <div class="mega-dropdown-col-preview" aria-hidden="true">
                      <img src="{default_preview}" alt="{default_alt}" loading="lazy" class="mega-preview-image">
                    </div>
                  </div>
                </div>
              </div>
            </li>"""


def header_html(base: str, active: str | None) -> str:

    def nav(link, href, label):
        ac, cls = current(active, link)
        return f"""            <li class="nav-item">
              <a href="{base}{href}"{ac} class="nav-link{cls}">{label}</a>
            </li>"""

    def off(link, href, label):
        ac, cls = current(active, link)
        return f"""            <li class="offcanvas-nav-item">
              <a href="{base}{href}"{ac} class="offcanvas-nav-link{cls}">{label}</a>
            </li>"""

    def offcanvas_products(base: str, active: str | None) -> str:
        _, cls = current(active, "products")
        expanded = "false"
        hidden_attr = " hidden"
        subs = []
        for product in PRODUCTS:
            subs.append(
                f"""              <li class="offcanvas-products-sub-item">
                <a href="{base}{product["file"]}" class="offcanvas-products-sub-link">{product["title"]}</a>
              </li>"""
            )
        subs_html = "\n".join(subs)
        return f"""            <li class="offcanvas-nav-item offcanvas-nav-item-products">
              <button type="button" class="offcanvas-nav-link offcanvas-products-toggle{cls}" aria-expanded="{expanded}" aria-controls="offcanvas-products-menu">Products</button>
              <ul id="offcanvas-products-menu" class="offcanvas-products-menu" role="list"{hidden_attr}>
{subs_html}
              </ul>
            </li>"""

    logo_ac, logo_cls = current(active, "home")

    return f"""    <header class="header-area">
      <div class="w-layout-blockcontainer container w-container">
        <div class="header-wrap">
          <a href="{base}index.html"{logo_ac} class="nav-logo-wrap w-inline-block{logo_cls}"><img src="{base}videos/logo.png" loading="lazy" width="60" height="Auto" alt="Hydromax" sizes="(max-width: 479px) 100vw, 60px" class="nav-logo"></a>
          <ul role="list" class="nav">
{nav("home", "index.html", "Home")}
{nav("about", "about.html", "About")}
{nav("service", "service.html", "Service")}
{products_mega_item(base, active)}
{nav("contact", "contact.html", "Contact")}
          </ul>
          <div class="nav-right">
            <div class="btn-nav">
              <a href="{base}contact.html" class="btn-secondary w-inline-block">
                <div>Book a meeting</div>
              </a>
            </div>
            <div class="offcanvas-icon"><img src="{base}images/menu.svg" loading="lazy" alt="Icon" class="menu-icon"></div>
          </div>
        </div>
      </div>
      <div class="offcanvas-main">
        <div class="offcanvas-wrap">
          <div class="offcanvas-top">
            <a href="{base}index.html" class="offcanvas-logo-wrap w-inline-block"><img src="{base}videos/logo.png" loading="lazy" alt="Hydromax" class="offcanvas-logo"></a><button type="button" class="offcanvas-close-btn" aria-label="Close menu"><img src="{base}images/close.svg" loading="lazy" alt="" class="close-icon" data-w-id="d796b440-c147-1529-3014-cb4222a1441c"></button>
          </div>
          <ul role="list" class="offcanvas-nav">
{off("home", "index.html", "Home")}
{off("about", "about.html", "About")}
{off("service", "service.html", "Service")}
{offcanvas_products(base, active)}
{off("contact", "contact.html", "Contact")}
          </ul>
        </div>
      </div>
    </header>"""


def footer_html(base: str, active: str | None) -> str:
    def foot(link, href, label):
        ac, cls = current(active, link)
        return f"""              <li class="nav-item-two">
                <a href="{base}{href}"{ac} class="footer-link w-inline-block{cls}">
                  <div class="nav-link-two">{label}</div><img src="{base}images/arrow-right.svg" loading="lazy" alt="" class="arrow-right">
                </a>
              </li>"""

    def foot_products(base, active):
        ac, cls = ("", "")
        if active == "products":
            ac, cls = ' aria-current="page"', " w--current"
        return f"""              <li class="nav-item-two">
                <a href="{base}pumps.html"{ac} class="footer-link w-inline-block{cls}">
                  <div class="nav-link-two">Products</div><img src="{base}images/arrow-right.svg" loading="lazy" alt="" class="arrow-right">
                </a>
              </li>"""

    return f"""    <footer class="footer-area">
      <div class="w-layout-blockcontainer container w-container">
        <div class="footer-top">
          <div class="footer-widget">
            <h2 data-w-id="ab93d299-3b29-96eb-810e-55a6992be544" class="heading-five text-white">Building Tomorrow’s Water , Today</h2>
            <form action="/search" data-w-id="58deabdb-3fec-7b85-53d0-d7c9241abf0e" class="search w-form"><input class="search-input w-input" maxlength="256" name="query" placeholder="Search…" type="search" id="search-footer" required=""><input type="submit" class="btn-search w-button" value="Search"></form>
          </div>
          <div class="footer-widget">
            <ul data-w-id="6ebfc4ba-b4d8-a260-9886-80911291f833" role="list" class="footer-nav">
{foot("home", "index.html", "Home")}
{foot("about", "about.html", "About")}
{foot("service", "service.html", "Services")}
{foot_products(base, active)}
{foot("contact", "contact.html", "Contact")}
            </ul>
          </div>
        </div>
        <div class="footer-btm"><img class="footer-img" src="{base}videos/logo.png" width="400" height="Auto" alt="shresta" sizes="(max-width: 479px) 100vw, 400px" data-w-id="ab93d299-3b29-96eb-810e-55a6992be547" loading="lazy" srcset="{base}images/sres322-p-500.png 500w, {base}images/sres322-p-800.png 800w, {base}images/sres322.png 1000w">
          <div class="footer-btm-right"><img src="{base}videos/logo.png" loading="lazy" width="Auto" height="Auto" alt="Logo" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" data-w-id="ab93d299-3b29-96eb-810e-55a6992be548"></div>
        </div>
        <div data-w-id="ab93d299-3b29-96eb-810e-55a6992be549" class="footer-copyright">
          <p class="copyright-text">© 2026 - All rights reserved Hydromax Pvt Ltd, Developed by\u00a0<a href="https://sameer-shaik.com" class="link">Sameer</a>
          </p>
        </div>
      </div>
    </footer>"""


HEADER_RE = re.compile(r"<header class=\"header-area.*?\">.*?</header>", re.DOTALL)
FOOTER_RE = re.compile(r"<footer class=\"footer-area\">.*?</footer>", re.DOTALL)

SKIP = {"401.html", "component-fc638601-a182-5826-3de1-2dd1b1107e78.html", "component-ab93d299-3b29-96eb-810e-55a6992be542.html"}


def product_banner_html(product: dict, base: str = "") -> str:
    poster = f'{base}{product["banner_poster"]}'
    mp4 = f'{base}{product["banner_mp4"]}'
    webm = f'{base}{product["banner_webm"]}'
    video_id = f'banner-video-{product["slug"]}'
    return f"""      <section class="banner-area">
        <div class="banner-overlay"></div>
        <div data-poster-url="{poster}" data-video-urls="{mp4},{webm}" data-autoplay="true" data-loop="true" data-wf-ignore="true" class="banner-video w-background-video w-background-video-atom"><video id="{video_id}" autoplay="" loop="" style="background-image:url(&quot;{poster}&quot;)" muted="" playsinline="" data-wf-ignore="true" data-object-fit="cover">
            <source src="{mp4}" data-wf-ignore="true">
            <source src="{webm}" data-wf-ignore="true">
          </video><noscript>
            <style>
  [data-wf-bgvideo-fallback-img] {{
    display: none;
  }}
  @media (prefers-reduced-motion: reduce) {{
    [data-wf-bgvideo-fallback-img] {{
      position: absolute;
      z-index: -100;
      display: inline-block;
      height: 100%;
      width: 100%;
      object-fit: cover;
    }}
  }}</style><img data-wf-bgvideo-fallback-img="true" src="{poster}" alt="">
          </noscript></div>
        <div class="w-layout-blockcontainer container w-container">
          <div class="banner-wrap">
            <h1 class="heading-two text-white">{product["title"]}</h1>
            <p class="section-content text-white indent-70">{product["desc"]}</p>
          </div>
        </div>
      </section>"""


def pump_showcase_section() -> str:
    path = ROOT / "partials" / "pump-showcase.html"
    return path.read_text()


def pump_booster_section() -> str:
    path = ROOT / "partials" / "pump-booster.html"
    return path.read_text()


def pump_centrifugal_section() -> str:
    path = ROOT / "partials" / "pump-centrifugal.html"
    return path.read_text()


def pump_sludge_section() -> str:
    path = ROOT / "partials" / "pump-sludge.html"
    return path.read_text()


def product_body_html(product: dict) -> str:
    if product["slug"] == "pumps":
        return (
            pump_showcase_section()
            + pump_booster_section()
            + pump_centrifugal_section()
            + pump_sludge_section()
        )
    return f"""      <section class="about-area">
        <div class="w-layout-blockcontainer container w-container">
          <div class="about-wrap">
            <div class="about-right">
              <div class="breadcrumbs">Products</div>
              <div class="about-content-main">
                <p class="about-content">Hydromax delivers {product["title"].lower()} engineered for performance, reliability, and long-term operational efficiency. Contact our team to discuss specifications, deployment, and support for your facility.</p>
              </div>
            </div>
          </div>
        </div>
      </section>"""


def inject_mega_assets(text: str, base: str) -> str:
    css_tag = f'<link href="{base}css/mega-nav.css" rel="stylesheet" type="text/css">'
    js_tag = f'<script src="{base}js/mega-nav.js" type="text/javascript"></script>'
    style_anchor = f'<link href="{base}css/hydromax.style.css" rel="stylesheet" type="text/css">'
    js_anchor = f'<script src="{base}js/hydromax.js" type="text/javascript"></script>'
    if css_tag not in text and style_anchor in text:
        text = text.replace(style_anchor, f"{style_anchor}\n  {css_tag}")
    if js_tag not in text and js_anchor in text:
        text = text.replace(js_anchor, f"{js_tag}\n  {js_anchor}")
    return text


def product_page_html(product: dict) -> str:
    pump_assets = ""
    if product["slug"] == "pumps":
        pump_assets = """
  <link href="css/pump-showcase.css" rel="stylesheet" type="text/css">
  <link href="css/pump-booster.css" rel="stylesheet" type="text/css">
  <link href="css/pump-centrifugal.css" rel="stylesheet" type="text/css">
  <link href="css/pump-sludge.css" rel="stylesheet" type="text/css">"""
    pump_script = ""
    if product["slug"] == "pumps":
        pump_script = """
  <script src="js/pump-showcase.js" type="text/javascript"></script>
  <script src="js/pump-booster.js" type="text/javascript"></script>
  <script src="js/pump-centrifugal.js" type="text/javascript"></script>"""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{product["title"]} | Hydromax</title>
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <link href="css/normalize.css" rel="stylesheet" type="text/css">
  <link href="css/hydromax.css" rel="stylesheet" type="text/css">
  <link href="css/hydromax.style.css" rel="stylesheet" type="text/css">
  <link href="css/mega-nav.css" rel="stylesheet" type="text/css">{pump_assets}
  <link href="https://fonts.googleapis.com" rel="preconnect">
  <link href="https://fonts.gstatic.com" rel="preconnect" crossorigin="anonymous">
  <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" type="text/javascript"></script>
  <script type="text/javascript">WebFont.load({{  google: {{    families: ["Instrument Sans:300,400,500,600,700","Manrope:300,400,500,600,700"]  }}}});</script>
  <script type="text/javascript">!function(o,c){{var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}}(window,document);</script>
  <link href="videos/shlogo.png" rel="shortcut icon" type="image/x-icon">
  <link href="videos/shlogo.png" rel="apple-touch-icon">
</head>
<body class="body">
  <div class="page-wrap">
{header_html("", "products")}
    <main class="main-wrap">
{product_banner_html(product)}
{product_body_html(product)}
    </main>
{footer_html("", "products")}
  </div>
  <script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=69e35025b207e3339c396d73" type="text/javascript" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
  <script src="js/mega-nav.js" type="text/javascript"></script>{pump_script}
  <script src="js/hydromax.js" type="text/javascript"></script>
</body>
</html>
"""


def main():
    for p in PRODUCTS:
        (ROOT / p["file"]).write_text(product_page_html(p))
        print("created", p["file"])

    for path in sorted(ROOT.rglob("*.html")):
        if path.name in SKIP or path.parent.name == "scripts":
            continue
        text = path.read_text()
        if "<header" not in text:
            continue
        base = "../" if path.parent.name == "templates" else ""
        name = path.name
        active = ACTIVE_MAP.get(name)

        if HEADER_RE.search(text):
            text = HEADER_RE.sub(header_html(base, active), text, count=1)
        if FOOTER_RE.search(text):
            text = FOOTER_RE.sub(footer_html(base, active), text, count=1)
        text = inject_mega_assets(text, base)

        path.write_text(text)
        print("updated", path.relative_to(ROOT))


if __name__ == "__main__":
    main()
