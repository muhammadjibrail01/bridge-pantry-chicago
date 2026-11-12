# Bridge Pantry Chicago website

A static nonprofit website: HTML5, CSS3, vanilla JavaScript, and Bootstrap 5.3.8 (self-hosted).
There is no build step and nothing to install. It deploys directly to GitHub Pages.

```
index.html  about.html  programs.html  volunteer.html  donate.html  impact.html  contact.html  404.html
css/style.css            all site styles (brand colors are variables at the top)
css/vendor/              Bootstrap 5.3.8
js/script.js             behavior + SITE_CONFIG (numbers, links, switches) at the top
js/vendor/               Bootstrap bundle (mobile menu, FAQ accordion)
fonts/                   Big Shoulders Display + Public Sans (self-hosted, SIL OFL)
images/                  logo, favicon, hero art, placeholders, social share card
docs/                    research paper PDF (linked from the Impact page)
sitemap.xml  robots.txt  .nojekyll
```

## Preview on your computer

Double-click `index.html`, or run `python3 -m http.server 8000` in this folder and open http://localhost:8000.
(Opening the file directly may print harmless font-preload messages in the browser console. They do not appear on GitHub Pages.)

## Deploy to GitHub Pages

1. Create a GitHub repository and upload **the contents of this folder** to the repository root (include `.nojekyll`).
2. Repository **Settings > Pages > Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`.
3. For `bridgepantrychicago.org`: add it under **Settings > Pages > Custom domain**, create the DNS records GitHub shows you, then tick **Enforce HTTPS**.
4. Canonical URLs, social cards, `sitemap.xml` and `robots.txt` assume **https://bridgepantrychicago.org**. If your address is different, find and replace that text across the files.
   If you publish first as a project site (`username.github.io/repo/`), also change `<base href="/">` in `404.html` to `<base href="/repo/">`.

## Before you go live

Yellow **Draft** boxes mark everything below. When you are done, set `showDraftNotes: false` in `js/script.js` and they all disappear.

| What | Where | Notes |
|---|---|---|
| Meals, pounds, tons | `SITE_CONFIG.stats` | Estimates from your paper (13,400 meals x 1.2 lb). Replace with weighed data. |
| **Volunteers, community members** | `SITE_CONFIG.stats` | **Placeholders (20+, 900+).** Enter real counts, then delete the "Placeholder figure" labels in `index.html` and `impact.html`. |
| Monthly meals chart | `SITE_CONFIG.charts.monthly` | **Sample data** that sums to 13,400. Replace with logged pickups. |
| Testimonials | `index.html` | **Sample quotes.** Use real ones with permission. Never name or photograph a neighbor without informed consent. |
| Founder photo + message | `about.html`, `images/founder-placeholder.svg` | The message is a draft for you to edit. Update the image's alt text when you add the photo. |
| Hero and story images | `images/hero-placeholder.svg`, `images/photo-slot-a.svg` | Swap in photos and write descriptive alt text (leave `alt=""` only for purely decorative images). |
| Volunteer Google Form | `data-google-form-url` in `volunteer.html` | Paste the form's embed URL. Until then a built-in form emails info@bridgepantrychicago.org. |
| Contact form | `SITE_CONFIG.forms.contactEndpoint` | Paste a Formspree/Web3Forms-style endpoint. Until then the form opens the visitor's email app. |
| Social links | `SITE_CONFIG.social` | Empty = icon shown but inactive. |
| **Donations** | `SITE_CONFIG.donate` | Everything is inactive. Paste each provider link and set `open: true`; buttons switch on by themselves (`{amount}` in `amountUrl` is replaced by the chosen gift). Add receipt and tax-deductibility wording only once your fiscal sponsor agreement confirms it. |
| Naming partners | footer, hero, Programs | Confirm Nando's is comfortable being named publicly before launch. |
| University wording | footer | The footer says the initiative is not an official University of Chicago program. Check it against the university's naming rules. |
| Research paper | `docs/`, Impact page | Delete the file and the "Research and policy" download button if you are not publishing it yet. |
| Get-help phone numbers and links | `contact.html` | Verified October 16, 2026 (311 and 312-744-5000, 2-1-1 and text 898-211, Food Depository map and 773-247-3663). Re-check them now and then. |
| Statistics | home and Impact pages | Taken from the cited sources in your paper. Re-verify before sending to funders. |

## Editing

- **Text:** edit the `.html` files. The header and footer are repeated on every page, so change them in each file.
- **Colors:** `:root` in `css/style.css`. Navy `#0B3C5D`, emerald `#2E8B57`, gold `#D4A017`. White text on the brand emerald only reaches 4.25:1, so buttons and small text use `--green-ink`; gold is used on navy, never as text on white.
- **Numbers and charts:** `SITE_CONFIG` at the top of `js/script.js`.

## What was tested

- Every page at desktop (1440px) and phone (390px) widths: no console errors, no failed requests, no sideways scrolling.
- axe-core WCAG 2.0/2.1/2.2 A and AA audit: 0 violations on every page at both widths (accordion and chart tables expanded).
- HTML validation (html-validate) clean; all internal links, anchors, image alt text and form labels checked.
- Behavior: mobile menu, FAQ, form validation and both submission paths, inactive donation buttons, the "attach links later" activation, skip link and keyboard focus, reduced-motion mode.
- Home page first view is roughly 145 KB over the wire.

## Licenses

Bootstrap 5.3.8 (MIT). Bootstrap Icons (MIT), inlined as SVG. Big Shoulders Display and Public Sans (SIL Open Font License 1.1; license files are in `fonts/`).
