/* app.js — cleaned + mobile menu fixed (touch-safe) */

/* -------------------------
   Tiny DOM helpers
--------------------------*/
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* -------------------------
   Top-level elements
--------------------------*/
const appEl = $("#app");
const yearEl = $("#year");
const menuBtn = $("#menuBtn");
const mobileMenu = $("#mobileMenu");

/* set year */
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =========================
   Mobile menu open/close
========================= */
function closeMobileMenu() {
  if (!mobileMenu || !menuBtn) return;

  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuBtn.setAttribute("aria-expanded", "false");

  // collapse any open <details>
  mobileMenu.querySelectorAll("details[open]").forEach(d => (d.open = false));
}

function openMobileMenu() {
  if (!mobileMenu || !menuBtn) return;

  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  menuBtn.setAttribute("aria-expanded", "true");
}

function toggleMobileMenu() {
  if (!mobileMenu || !menuBtn) return;
  const open = mobileMenu.classList.toggle("is-open");
  mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");

  if (!open) {
    mobileMenu.querySelectorAll("details[open]").forEach(d => (d.open = false));
  }
}

if (menuBtn) {
  menuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMobileMenu();
  });
}

/* =========================
   Hash parsing / Routing
========================= */
function parseHash() {
  const raw = (location.hash || "#home").replace("#", "").trim();
  const [routePart, sectionPart] = raw.split("/");
  return {
    route: (routePart || "home").toLowerCase(),
    section: (sectionPart || "").trim(),
  };
}

async function fetchPartial(file) {
  try {
    const res = await fetch(file, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");
    return await res.text();
  } catch {
    return null;
  }
}

function focusMain() {
  if (appEl) appEl.focus({ preventScroll: true });
}

function waitForElementById(id, timeoutMs = 1200) {
  const start = performance.now();
  return new Promise((resolve) => {
    const tick = () => {
      const el = document.getElementById(id);
      if (el) return resolve(el);
      if (performance.now() - start >= timeoutMs) return resolve(null);
      setTimeout(tick, 40);
    };
    tick();
  });
}

async function scrollToSection(sectionId) {
  if (!sectionId) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return;
  }
  const el = await waitForElementById(sectionId);
  if (!el) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return;
  }
  setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
}

/* Convert in-page anchors (#overview) to #route/overview */
function normalizeInPageAnchors(route) {
  $$('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;

    // Already #route/section
    if (/^#[^/]+\/.+/.test(href)) return;

    // Convert plain #section to #route/section
    if (href.length > 1 && !href.includes("/")) {
      const section = href.slice(1);
      a.setAttribute("href", `#${route}/${section}`);
    }
  });
}

/* =========================
   Highlights rotation (home)
========================= */
const HOME_HIGHLIGHTS = [
  {
    img: "assets/highlights/h1.jpg",
    title: "Best Paper Presentation Award, SMiLE 2026",
    text: "EV Charging Forecasting",
    link: "https://ri.kfupm.edu.sa/irc-sml/events/event-details/the-second-international-conference-on-smart-mobility-and-logistics-ecosystems-(smile)",
  },
  {
    img: "assets/highlights/h1.jpg",
    title: "Best Paper Presentation Award, SMiLE 2026",
    text: "Driver Drowsiness Detection for Smart Mobility.",
    link: "https://ri.kfupm.edu.sa/irc-sml/events/event-details/the-second-international-conference-on-smart-mobility-and-logistics-ecosystems-(smile)",
  },
  {
    img: "assets/highlights/h1.jpg",
    title: "Workshop",
    text: "ML for Smart Mobility in MATLAB",
    link: "https://events.kfupm.edu.sa/event/247/page/416-workshops",
  },
  {
    img: "assets/highlights/jdim.jpg",
    title: "Editor-in-Chief",
    text: "Journal of Data, Information and Management, Springer",
    link: "https://link.springer.com/journal/42488",
  },
  {
    img: "assets/highlights/iconip2026.png",
    title: "Tutorial and Workshop Co-Chair",
    text: "33rd International Conference on Neural Information Processing, Melbourne, 23-27 Nov. 2026",
    link: "https://www.iconip2026.org/",
  },
];

let hlIndex = 0;
let hlTimer = null;

function setDots(i) {
  $$(".hlDots .dot").forEach((d, idx) => d.classList.toggle("is-active", idx === i));
}

function renderHighlight(i) {
  const item = HOME_HIGHLIGHTS[i];
  const img = $("#hlImg");
  const title = $("#hlItemTitle");
  const text = $("#hlItemText");
  const link = $("#hlItemLink");
  if (!img || !title || !text || !link) return;

  img.onerror = () => (img.src = "assets/portrait.jpg");
  img.src = item.img;
  img.alt = item.title;

  title.textContent = item.title;
  text.textContent = item.text;
  link.href = item.link;

  setDots(i);
}

function startRotation() {
  stopRotation();
  hlTimer = setInterval(() => {
    hlIndex = (hlIndex + 1) % HOME_HIGHLIGHTS.length;
    renderHighlight(hlIndex);
  }, 6000);
}
function stopRotation() {
  if (hlTimer) clearInterval(hlTimer);
  hlTimer = null;
}

function initHomeHighlights() {
  if (!$("#hlImg")) return;

  hlIndex = 0;
  renderHighlight(0);
  startRotation();

  $$(".hlDots .dot").forEach((btn) => {
    btn.addEventListener("click", () => {
      hlIndex = Number(btn.dataset.i);
      renderHighlight(hlIndex);
      startRotation();
    });
  });
}

/* =========================
   Publications (unchanged)
========================= */
function initPublications() {
  const metricsEl = document.getElementById("pubMetricsData");
  if (metricsEl) {
    try {
      const data = JSON.parse(metricsEl.textContent || "{}");
      const set = (key, val) => {
        const node = document.querySelector(`[data-metric="${key}"]`);
        if (!node) return;
        if (node.tagName.toLowerCase() === "a") node.href = val || "#";
        else node.textContent = val ?? "—";
      };
      set("citations", data.citations);
      set("hindex", data.hindex);
      set("i10index", data.i10index);
      set("scholarLink", data.scholarLink);
    } catch {}
  }

  const yearSel = document.getElementById("pubYear");
  const topicSel = document.getElementById("pubTopic");
  const searchEl = document.getElementById("pubSearch");
  const resetBtn = document.getElementById("pubReset");
  const items = Array.from(document.querySelectorAll(".pubItem"));

  if (!yearSel || !topicSel || !searchEl || !resetBtn || items.length === 0) return;

  const years = Array.from(new Set(items.map(n => n.dataset.year).filter(Boolean)))
    .sort((a, b) => Number(b) - Number(a));
  for (const y of years) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSel.appendChild(opt);
  }

  const topicSet = new Set();
  for (const n of items) {
    const topics = (n.dataset.topics || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    topics.forEach(t => topicSet.add(t));
  }
  const topics = Array.from(topicSet).sort((a, b) => a.localeCompare(b));
  for (const t of topics) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    topicSel.appendChild(opt);
  }

  function applyFilter() {
    const y = yearSel.value;
    const t = topicSel.value;
    const q = (searchEl.value || "").trim().toLowerCase();

    for (const n of items) {
      const ny = n.dataset.year || "";
      const nt = (n.dataset.topics || "").toLowerCase();
      const text = (n.textContent || "").toLowerCase();

      const okYear = (y === "all") || (ny === y);
      const okTopic = (t === "all") || nt.includes(t.toLowerCase());
      const okSearch = (!q) || text.includes(q);

      n.style.display = (okYear && okTopic && okSearch) ? "" : "none";
    }
  }

  yearSel.addEventListener("change", applyFilter);
  topicSel.addEventListener("change", applyFilter);
  searchEl.addEventListener("input", applyFilter);

  resetBtn.addEventListener("click", () => {
    yearSel.value = "all";
    topicSel.value = "all";
    searchEl.value = "";
    applyFilter();
  });

  applyFilter();
}

/* =========================
   Routing
========================= */
async function renderRoute() {
  const { route, section } = parseHash();
  if (!appEl) return;

  const map = {
    home: "home.html",
    research: "research.html",
    publications: "publications.html",
    teaching: "teaching.html",
    service: "service.html",
  };

  const file = map[route] || "home.html";
  const html = await fetchPartial(file);

  if (html) {
    appEl.innerHTML = html;
  } else {
    appEl.innerHTML = `
      <section class="section">
        <div class="card">
          <h2 class="h2">Loading issue</h2>
          <p class="muted">
            Could not load <strong>${file}</strong>. Open the site using a local server
            (e.g., VSCode Live Server) so fetch() can read files.
          </p>
        </div>
      </section>
    `;
  }

  if (route === "home") initHomeHighlights();
  if (route === "publications") initPublications();

  normalizeInPageAnchors(route);
  await scrollToSection(section);
  focusMain();
}

/* hash navigation */
window.addEventListener("hashchange", () => {
  closeMobileMenu();
  renderRoute();
});

/* initial render */
renderRoute();

/* =========================
   Theme + Language
========================= */
(function settingsThemeLang() {
  const root = document.documentElement;
  const STORAGE_THEME_KEY = "pref_theme_mode"; // light|dark|system
  const STORAGE_LANG_KEY = "pref_lang";       // en|ar

  const get = (k, fallback = null) => {
    try { return localStorage.getItem(k) ?? fallback; } catch { return fallback; }
  };
  const set = (k, v) => {
    try { localStorage.setItem(k, v); } catch {}
  };

  function resolveTheme(mode) {
    const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    if (mode === "system") return systemDark ? "dark" : "light";
    return mode === "dark" ? "dark" : "light";
  }

  function applyTheme(mode = "system") {
    const resolved = resolveTheme(mode);
    root.setAttribute("data-theme", resolved);
    set(STORAGE_THEME_KEY, mode);

    document.querySelectorAll("[data-theme]").forEach(btn => {
      btn.classList.toggle("is-active", btn.getAttribute("data-theme") === mode);
    });
  }

  function applyLang(lang = "en") {
    root.setAttribute("lang", lang);
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    set(STORAGE_LANG_KEY, lang);

    document.querySelectorAll("[data-lang]").forEach(btn => {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });
  }

  document.addEventListener("click", (e) => {
    const themeBtn = e.target.closest("[data-theme]");
    if (themeBtn) applyTheme(themeBtn.getAttribute("data-theme"));

    const langBtn = e.target.closest("[data-lang]");
    if (langBtn) applyLang(langBtn.getAttribute("data-lang"));
  });

  applyTheme(get(STORAGE_THEME_KEY, "system"));
  applyLang(get(STORAGE_LANG_KEY, "en"));

  window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener("change", () => {
    const mode = get(STORAGE_THEME_KEY, "system");
    if (mode === "system") applyTheme("system");
  });
})();

/* =========================
   Desktop dropdowns: Settings + Social
========================= */
(function dropdownWiring() {
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsWrap = settingsBtn?.closest(".navItem--settings");

  const socialBtn = document.getElementById("socialBtn");
  const socialWrap = socialBtn?.closest(".navItem--social");

  function closeAll() {
    settingsWrap?.classList.remove("is-open");
    socialWrap?.classList.remove("is-open");
    settingsBtn?.setAttribute("aria-expanded", "false");
    socialBtn?.setAttribute("aria-expanded", "false");
  }

  function toggleWrap(btn, wrap) {
    if (!btn || !wrap) return;
    const open = wrap.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  settingsBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // close other
    socialWrap?.classList.remove("is-open");
    socialBtn?.setAttribute("aria-expanded", "false");
    toggleWrap(settingsBtn, settingsWrap);
  });

  socialBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // close other
    settingsWrap?.classList.remove("is-open");
    settingsBtn?.setAttribute("aria-expanded", "false");
    toggleWrap(socialBtn, socialWrap);
  });

  document.addEventListener("click", () => closeAll());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
})();

/* =========================
   Mobile menu behavior (FIX)
   - Accordion: only one <details> open
   - Tap a link: close menu & allow navigation
   - Outside tap: close menu (touch-safe)
========================= */
(function mobileMenuFix() {
  if (!mobileMenu) return;

  // Delegated click: summary vs link
  mobileMenu.addEventListener("click", (e) => {
    const summary = e.target.closest("summary");
    if (summary) {
      const details = summary.closest("details");
      if (!details) return;

      // Wait a tick for browser to set details.open, then close others
      setTimeout(() => {
        if (!details.open) return;
        mobileMenu.querySelectorAll("details[open]").forEach(d => {
          if (d !== details) d.open = false;
        });
      }, 0);
      return;
    }

    const link = e.target.closest("a");
    if (link) {
      // Let hash change happen naturally, just close UI
      closeMobileMenu();
    }
  });

  // Outside tap close (use composedPath for mobile reliability)
  document.addEventListener("click", (e) => {
    if (!mobileMenu.classList.contains("is-open")) return;

    const path = e.composedPath ? e.composedPath() : [];
    const clickedInsideMenu = path.includes(mobileMenu) || mobileMenu.contains(e.target);
    const clickedMenuBtn = path.includes(menuBtn) || e.target === menuBtn || menuBtn?.contains(e.target);

    if (!clickedInsideMenu && !clickedMenuBtn) {
      closeMobileMenu();
    }
  });

  // Escape closes menu
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileMenu();
  });
})();
