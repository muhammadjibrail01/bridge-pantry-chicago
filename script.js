/*! Bridge Pantry Chicago: site script. Vanilla JavaScript; the only dependency is Bootstrap's own bundle
 *  (menu + FAQ accordion). Everything an editor is likely to change lives in SITE_CONFIG below. */
(function () {
  'use strict';

  /* ==========================================================================
     SITE CONFIG: the one place to edit numbers, links, and switches
     ========================================================================== */
  var SITE_CONFIG = {

    // Small yellow "Draft" notes flag placeholder content on the page.
    // Set to false before launch to hide every one of them at once.
    showDraftNotes: true,

    // Impact numbers (home + Impact pages). Each is shown as value + suffix.
    //  meals, pounds, tons ... estimates from the research paper (13,400 meals x 1.2 lb per meal).
    //                          Replace with weighed/logged data once pickup logs are running.
    //  volunteers, community . PLACEHOLDERS. Replace with real counts, then delete the
    //                          "Placeholder figure" labels in index.html and impact.html.
    //  partners .............. Nando's PERi-PERi Harvest Program locations.
    stats: {
      meals:      { value: 13400, suffix: '+' },
      pounds:     { value: 16000, suffix: '+' },
      tons:       { value: 8,     suffix: '+' },
      volunteers: { value: 20,    suffix: '+' },
      community:  { value: 900,   suffix: '+' },
      partners:   { value: 8,     suffix: ''  }
    },

    // Giving stays INACTIVE until `open` is true AND a provider link is filled in.
    // To activate: paste each link below, set open: true. Nothing else to change.
    //   url ......... where the button sends people
    //   amountUrl ... optional; {amount} is replaced with the chosen gift, e.g. 'https://paypal.me/YourName/{amount}'
    donate: {
      open: false,
      providers: {
        paypal:   { url: '', amountUrl: '' },
        gofundme: { url: '' },
        stripe:   { url: '', amountUrl: '' }
      }
    },

    // A static site needs a form service. Leave '' to fall back to the visitor's email app.
    //  contactEndpoint ... e.g. 'https://formspree.io/f/xxxxxxxx' (Formspree-style JSON endpoint)
    //  volunteerEndpoint . optional; used by the built-in volunteer form (not needed if you embed a Google Form)
    forms: {
      contactEndpoint: '',
      volunteerEndpoint: '',
      toEmail: 'info@bridgepantrychicago.org'
    },

    // Social profile URLs. Empty = the icon is shown but inactive.
    social: { linkedin: '', instagram: '', facebook: '', x: '' },

    // Chart data (Impact + Donate pages)
    charts: {
      // SAMPLE data: monthly values sum to 13,400 meals to match the estimate above. Replace with logged data.
      monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        values: [620, 980, 1240, 1380, 1456, 1520, 1600, 1680, 1760, 1164]
      },
      // Dollars per meal. type: est = estimated today, proj = projected for planned vehicle, bench = outside benchmark
      cost: [
        { label: 'Today: volunteer operation (cash only)', value: 0.38, type: 'est' },
        { label: 'Refrigerated van pilot (cash)', value: 1.33, type: 'proj' },
        { label: 'Full-size refrigerated truck (cash)', value: 1.44, type: 'proj' },
        { label: 'Full-size truck including capital', value: 1.63, type: 'proj' },
        { label: 'Greater Chicago Food Depository, FY2025 (cash)', value: 0.90, type: 'bench' },
        { label: 'Illinois SNAP benefit per meal, June 2026', value: 2.07, type: 'bench' },
        { label: 'U.S. average cost of a meal, 2024', value: 3.70, type: 'bench' }
      ],
      // ReFED 2024 Illinois foodservice surplus (thousand tons) and share donated (%)
      surplus: [
        { label: 'Full-service restaurants', tons: 184.2, donated: 0.13 },
        { label: 'Limited-service restaurants', tons: 110.6, donated: 0.48 },
        { label: 'K-12 education', tons: 30.6, donated: 0.18 },
        { label: 'Lodging', tons: 29.5, donated: 0.11 },
        { label: 'Recreation', tons: 24.1, donated: 0.11 },
        { label: 'Caterers', tons: 17.9, donated: 0.11 },
        { label: 'Transportation', tons: 14.6, donated: 0.30 },
        { label: 'Healthcare', tons: 12.4, donated: 0.20 }
      ],
      // Planned allocation of operating costs (research paper, Table 3). Percent of total.
      funds: [
        { label: 'Coordination and volunteer support', sub: 'A paid driver-coordinator, wages and benefits', pct: 44.9, color: '#0B3C5D' },
        { label: 'Vehicle operations', sub: 'Fuel, maintenance, insurance, licenses, and a commissary', pct: 26.9, color: '#2E8B57' },
        { label: 'Food-safe packaging and supplies', sub: 'Sealed, food-safe containers and supplies', pct: 13.9, color: '#D4A017' },
        { label: 'Administration and fiscal sponsorship', sub: 'General administration and the fiscal sponsor fee', pct: 14.3, color: '#9DB8CA' }
      ]
    }
  };

  /* ==========================================================================
     Helpers
     ========================================================================== */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  function short(n) { return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(Math.round(n)); }

  // Run cb once when el is at least `threshold` visible (or right away if motion/IO is unavailable)
  function whenVisible(el, cb, threshold) {
    if (reduceMotion || !hasIO) { cb(el); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { io.unobserve(entry.target); cb(entry.target); }
      });
    }, { threshold: threshold || 0.25 });
    io.observe(el);
  }

  /* ==========================================================================
     Draft notes + social links
     ========================================================================== */
  function setupDraftNotes() {
    if (!SITE_CONFIG.showDraftNotes) document.documentElement.classList.add('no-draft-notes');
  }

  function setupSocial() {
    $$('[data-social]').forEach(function (a) {
      var key = a.getAttribute('data-social');
      var url = SITE_CONFIG.social[key];
      if (url) {
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      } else {
        a.classList.add('is-inactive');
        a.setAttribute('aria-disabled', 'true');
        a.setAttribute('tabindex', '-1');
        a.setAttribute('aria-label', (a.getAttribute('aria-label') || '') + ' (coming soon)');
        a.addEventListener('click', function (e) { e.preventDefault(); });
      }
    });
  }

  /* ==========================================================================
     Animated counters
     ========================================================================== */
  function formatStat(cfg, value) { return fmt(value) + (cfg.suffix || ''); }

  function countUp(el, cfg) {
    var start = null, duration = 1500;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatStat(cfg, cfg.value * eased);
      if (p < 1) window.requestAnimationFrame(frame);
      else el.textContent = formatStat(cfg, cfg.value);
    }
    window.requestAnimationFrame(frame);
  }

  function setupStats() {
    $$('[data-stat]').forEach(function (el) {
      var cfg = SITE_CONFIG.stats[el.getAttribute('data-stat')];
      if (!cfg) return;
      var finalText = formatStat(cfg, cfg.value);
      var sr = el.parentNode && $('[data-stat-sr="' + el.getAttribute('data-stat') + '"]', el.parentNode);
      if (sr) sr.textContent = finalText;
      el.textContent = finalText;
      if (!reduceMotion && hasIO) {
        el.textContent = formatStat(cfg, 0);
        whenVisible(el, function () { countUp(el, cfg); }, 0.4);
      }
    });
    $$('[data-draw]').forEach(function (el) {
      whenVisible(el, function () { el.classList.add('is-drawn'); }, 0.3);
    });
  }

  /* ==========================================================================
     Charts (accessible: text values stay in the DOM, bars are decorative)
     ========================================================================== */
  function chartBody(fig) {
    var b = $('.chart-body', fig);
    if (!b) { b = document.createElement('div'); b.className = 'chart-body'; fig.appendChild(b); }
    return b;
  }

  function appendTable(fig, headers, rows, foot) {
    var d = document.createElement('details');
    d.className = 'chart-data';
    var html = '<summary>View chart data as a table</summary><table><thead><tr>' +
      headers.map(function (h) { return '<th scope="col">' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') +
      '</tbody>' + (foot ? '<tfoot><tr><th scope="row">Total</th><td>' + foot + '</td></tr></tfoot>' : '') + '</table>';
    d.innerHTML = html;
    var note = $('.chart-note', fig);
    fig.insertBefore(d, note ? note : null);
  }

  function renderMonthly(fig) {
    var d = SITE_CONFIG.charts.monthly, n = d.values.length;
    var max = Math.max.apply(null, d.values);
    var total = d.values.reduce(function (a, b) { return a + b; }, 0);
    var bars = d.values.map(function (v, i) {
      return '<div class="vbar' + (i === n - 1 ? ' is-latest' : '') + '"><span class="vbar-value"><span class="v-full">' + fmt(v) +
        '</span><span class="v-short">' + short(v) + '</span></span><div class="vbar-fill" style="--h:' + (v / max * 86).toFixed(1) + '%"></div></div>';
    }).join('');
    var labels = d.labels.map(function (l) { return '<span>' + l + '</span>'; }).join('');
    chartBody(fig).innerHTML =
      '<div class="vbars-wrap"><div class="vbars" style="--n:' + n + '" role="img" aria-label="Bar chart of meals recovered per month, ' +
      d.labels[0] + ' to ' + d.labels[n - 1] + ' 2026. A data table follows.">' + bars + '</div>' +
      '<div class="vlabels" style="--n:' + n + '" aria-hidden="true">' + labels + '</div></div>';
    appendTable(fig, ['Month', 'Meals recovered'], d.labels.map(function (l, i) { return [l, fmt(d.values[i])]; }), fmt(total));
  }

  function renderCost(fig) {
    var rows = SITE_CONFIG.charts.cost, max = 4;
    chartBody(fig).innerHTML = '<div class="hbars">' + rows.map(function (r) {
      return '<div class="hbar"><span class="hbar-label">' + r.label + '</span>' +
        '<div class="hbar-track" aria-hidden="true"><div class="hbar-fill t-' + r.type + '" style="--w:' + (r.value / max * 100).toFixed(1) + '%"></div></div>' +
        '<span class="hbar-value">$' + r.value.toFixed(2) + '</span></div>';
    }).join('') + '</div>';
  }

  function renderSurplus(fig) {
    var rows = SITE_CONFIG.charts.surplus, max = 200;
    chartBody(fig).innerHTML = '<div class="hbars">' + rows.map(function (r) {
      return '<div class="hbar"><span class="hbar-label">' + r.label + '<small class="d-block text-soft">' + r.tons.toFixed(1) + 'k tons</small></span>' +
        '<div class="hbar-track" aria-hidden="true"><div class="hbar-fill t-gap" style="--w:' + (r.tons / max * 100).toFixed(1) + '%"></div></div>' +
        '<span class="hbar-value">' + r.donated.toFixed(2) + '%<small>donated</small></span></div>';
    }).join('') + '</div>';
  }

  function renderFunds(fig) {
    var rows = SITE_CONFIG.charts.funds;
    var R = 78, C = 2 * Math.PI * R, offset = 0;
    var segs = rows.map(function (r) {
      var len = r.pct / 100 * C;
      var seg = '<circle class="seg" cx="100" cy="100" r="' + R + '" stroke="' + r.color + '" stroke-dasharray="0 ' + C.toFixed(2) +
        '" data-final="' + Math.max(len - 2, 0).toFixed(2) + ' ' + (C - Math.max(len - 2, 0)).toFixed(2) + '" stroke-dashoffset="' + (-offset).toFixed(2) + '"/>';
      offset += len;
      return seg;
    }).join('');
    var legend = rows.map(function (r) {
      return '<li><span class="swatch" style="background:' + r.color + '"></span><span>' + r.label +
        '<span class="legend-sub">' + r.sub + '</span></span><strong>' + Math.round(r.pct) + '%</strong></li>';
    }).join('');
    chartBody(fig).innerHTML = '<div class="donut-wrap"><div class="donut-box"><svg class="donut" viewBox="0 0 200 200" aria-hidden="true" focusable="false">' +
      '<circle cx="100" cy="100" r="' + R + '" stroke="#E3EDF4"/>' + segs + '</svg>' +
      '<div class="donut-center" aria-hidden="true"><div><strong>Every $1</strong><span>planned use</span></div></div></div>' +
      '<ul class="legend" aria-label="Planned use of each dollar">' + legend + '</ul></div>';
  }

  function setupCharts() {
    var map = { monthly: renderMonthly, cost: renderCost, surplus: renderSurplus, funds: renderFunds };
    $$('[data-chart]').forEach(function (fig) {
      var fn = map[fig.getAttribute('data-chart')];
      if (!fn) return;
      fn(fig);
      whenVisible(fig, function () {
        fig.classList.add('is-drawn');
        $$('.seg', fig).forEach(function (s) { s.style.strokeDasharray = s.getAttribute('data-final'); });
      }, 0.25);
    });
  }

  /* ==========================================================================
     Donation controls (inactive until configured)
     ========================================================================== */
  function setupDonate() {
    var cfg = SITE_CONFIG.donate;
    var fieldset = $('#amount-fieldset');
    var buttons = $$('[data-donate-provider]');
    if (!fieldset && !buttons.length) return;

    function providerLive(p) {
      var c = cfg.providers[p];
      return !!(cfg.open && c && (c.url || c.amountUrl));
    }

    if (!cfg.open) {
      buttons.forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); }); });
      return;
    }

    var banner = $('#giving-status');
    var custom = $('#custom-amount');
    var summary = $('#gift-summary');
    if (banner) banner.hidden = true;
    if (fieldset) fieldset.disabled = false;
    if (custom) custom.disabled = false;

    function amount() {
      var r = $('input[name="amount"]:checked');
      if (!r) return null;
      if (r.value === 'custom') { var v = parseFloat(custom.value); return v > 0 ? v : null; }
      return parseFloat(r.value);
    }

    function refresh() {
      var a = amount();
      buttons.forEach(function (b) {
        var p = b.getAttribute('data-donate-provider');
        if (!providerLive(p)) return;
        var c = cfg.providers[p];
        b.href = (a && c.amountUrl) ? c.amountUrl.replace('{amount}', encodeURIComponent(a)) : (c.url || c.amountUrl.replace('{amount}', ''));
      });
      if (summary) summary.textContent = a ? 'Your gift: $' + a.toLocaleString('en-US') : '';
    }

    buttons.forEach(function (b) {
      var p = b.getAttribute('data-donate-provider');
      if (!providerLive(p)) return;
      b.classList.remove('disabled', 'btn-bp-inactive');
      b.classList.add('btn-bp-navy');
      b.removeAttribute('aria-disabled');
      b.removeAttribute('tabindex');
      b.removeAttribute('role');
      b.target = '_blank';
      b.rel = 'noopener noreferrer';
      b.textContent = b.getAttribute('data-label-active') || 'Give';
    });

    $$('input[name="amount"]').forEach(function (i) {
      i.addEventListener('change', function () {
        if (custom && i.value === 'custom') custom.focus();
        refresh();
      });
    });
    if (custom) custom.addEventListener('input', function () {
      var radio = $('input[name="amount"][value="custom"]');
      if (radio) radio.checked = true;
      refresh();
    });
    refresh();
  }

  /* ==========================================================================
     Forms: validation, submission, and email fallback
     ========================================================================== */
  function showStatus(form, msg, kind) {
    var s = $('[data-form-status]', form);
    if (!s) return;
    s.textContent = msg;
    s.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  function validate(form) {
    form.classList.add('was-validated');
    var ok = form.checkValidity();
    var firstBad = null;
    $$('[data-require-one]', form).forEach(function (fs) {
      var any = $$('input[type="checkbox"]', fs).some(function (c) { return c.checked; });
      fs.classList.toggle('has-error', !any);
      if (!any) { ok = false; if (!firstBad) firstBad = $('input', fs); }
    });
    $$('input, select, textarea', form).forEach(function (f) {
      if (f.willValidate && !f.checkValidity()) {
        f.setAttribute('aria-invalid', 'true');
        if (!firstBad || (firstBad.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_PRECEDING)) firstBad = f;
      } else {
        f.removeAttribute('aria-invalid');
      }
    });
    if (firstBad) firstBad.focus();
    return ok;
  }

  function mailtoFor(type, data) {
    var to = SITE_CONFIG.forms.toEmail, subject, lines;
    if (type === 'contact') {
      subject = '[Website] ' + data.get('subject') + ' - ' + data.get('name');
      lines = ['Name: ' + data.get('name'), 'Email: ' + data.get('email'), 'Organization: ' + (data.get('organization') || '-'), '', data.get('message')];
    } else {
      subject = '[Volunteer signup] ' + data.get('name');
      lines = ['Name: ' + data.get('name'), 'Email: ' + data.get('email'), 'Phone: ' + (data.get('phone') || '-'),
        'Neighborhood or ZIP: ' + (data.get('area') || '-'), 'Ways to help: ' + data.getAll('roles').join(', '),
        'Availability: ' + (data.getAll('availability').join(', ') || '-'), 'Has a car: ' + (data.get('vehicle') ? 'Yes' : 'No'),
        '', 'Notes: ' + (data.get('message') || '-')];
    }
    return 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\r\n'));
  }

  function setupForms() {
    $$('form[data-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        showStatus(form, '', '');
        if (!validate(form)) {
          showStatus(form, 'Please fix the highlighted fields and try again.', 'error');
          return;
        }
        var data = new FormData(form);
        if (data.get('website')) return;                       // honeypot caught a bot
        var type = form.getAttribute('data-form');
        var endpoint = SITE_CONFIG.forms[type + 'Endpoint'];
        var btn = $('button[type="submit"]', form);
        if (endpoint) {
          if (btn) btn.disabled = true;
          showStatus(form, 'Sending...', '');
          fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
            .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); })
            .then(function () {
              form.reset();
              form.classList.remove('was-validated');
              showStatus(form, 'Thank you. Your message was sent and we will be in touch soon.', 'success');
            })
            .catch(function () {
              showStatus(form, 'Sorry, that did not send. Please email us directly at ' + SITE_CONFIG.forms.toEmail + '.', 'error');
            })
            .then(function () { if (btn) btn.disabled = false; });
        } else {
          window.location.href = mailtoFor(type, data);
          showStatus(form, 'Your email app should open with your message ready to send. If it does not, write to us at ' + SITE_CONFIG.forms.toEmail + '.', 'success');
        }
      });
      // clear the "choose at least one" error as soon as a box is ticked
      form.addEventListener('change', function (e) {
        var fs = e.target.closest && e.target.closest('[data-require-one]');
        if (fs && $$('input[type="checkbox"]', fs).some(function (c) { return c.checked; })) fs.classList.remove('has-error');
      });
    });

    // contact.html?subject=partnership preselects the subject
    var sel = $('#c-subject');
    if (sel) {
      var key = new URLSearchParams(window.location.search).get('subject');
      if (key) {
        var opt = $('option[data-key="' + key.replace(/[^a-z]/gi, '') + '"]', sel);
        if (opt) sel.value = opt.value;
      }
    }
  }

  // Swap the built-in volunteer form for a Google Form embed once a real link is pasted in volunteer.html
  function setupVolunteerEmbed() {
    var wrap = $('#volunteer-form-wrap');
    if (!wrap) return;
    var url = (wrap.getAttribute('data-google-form-url') || '').trim();
    if (!url || /REPLACE_WITH/i.test(url)) return;
    var frame = document.createElement('iframe');
    frame.className = 'embed-frame';
    frame.src = url;
    frame.title = 'Volunteer signup form';
    frame.loading = 'lazy';
    frame.textContent = 'Loading form...';
    var p = document.createElement('p');
    p.className = 'small mt-3';
    p.innerHTML = 'Trouble viewing the form? <a target="_blank" rel="noopener noreferrer" href="' + url.replace('?embedded=true', '') + '">Open it in a new tab</a>.';
    wrap.innerHTML = '<h3>Tell us about yourself</h3>';
    wrap.appendChild(frame);
    wrap.appendChild(p);
  }

  /* ==========================================================================
     Init
     ========================================================================== */
  function init() {
    setupDraftNotes();
    setupSocial();
    setupStats();
    setupCharts();
    setupDonate();
    setupForms();
    setupVolunteerEmbed();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
