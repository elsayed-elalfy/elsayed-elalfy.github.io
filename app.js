/* app.js — cleaned, complete, and mobile-safe (menus + settings + theme/lang + routing) */

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

/* -------------------------
   Desktop dropdown wrappers
--------------------------*/
const settingsBtn = $("#settingsBtn");
const socialBtn = $("#socialBtn");
const settingsWrap = settingsBtn?.closest(".navItem--settings") || null;
const socialWrap = socialBtn?.closest(".navItem--social") || null;

/* =========================
   Close helpers (single source)
========================= */
function closeMobileMenu() {
  if (!mobileMenu || !menuBtn) return;
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuBtn.setAttribute("aria-expanded", "false");

  // collapse any open detail groups
  mobileMenu.querySelectorAll("details[open]").forEach((d) => (d.open = false));
}

function closeSettings() {
  if (!settingsWrap) return;
  settingsWrap.classList.remove("is-open");
  settingsBtn?.setAttribute("aria-expanded", "false");
}

function closeSocial() {
  if (!socialWrap) return;
  socialWrap.classList.remove("is-open");
  socialBtn?.setAttribute("aria-expanded", "false");
}

function closeDesktopDropdowns() {
  closeSettings();
  closeSocial();
}

/* =========================
   Mobile menu toggle
   - Opening mobile closes desktop dropdowns
========================= */
function toggleMobileMenu() {
  if (!mobileMenu || !menuBtn) return;

  // If opening, close desktop dropdowns so nothing stacks behind
  const willOpen = !mobileMenu.classList.contains("is-open");
  if (willOpen) closeDesktopDropdowns();

  const open = mobileMenu.classList.toggle("is-open");
  mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

/* Mobile menu button */
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

/* Wait until an element exists (helpful after innerHTML replace) */
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

/* Scroll helper */
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
    if (!href || !href.startsWith("#")) return;

    // Already in the form #route/section
    if (/^#[^/]+\/.+/.test(href)) return;

    // Don't rewrite top-level routes like #home/#research/#publications...
    const topRoutes = ["home", "research", "publications", "teaching", "service"];
    const token = href.slice(1).toLowerCase();
    if (topRoutes.includes(token)) return;

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
  $$(".hlDots .dot").forEach((d, idx) =>
    d.classList.toggle("is-active", idx === i)
  );
}

function renderHighlight(i) {
  const item = HOME_HIGHLIGHTS[i];
  const img = $("#hlImg");
  const title = $("#hlItemTitle");
  const text = $("#hlItemText");
  const link = $("#hlItemLink");

  if (!img || !title || !text || !link) return;

  img.onerror = () => {
    img.src = "assets/portrait.jpg";
  };
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
   Publications helpers
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

  const years = Array.from(new Set(items.map((n) => n.dataset.year).filter(Boolean))).sort(
    (a, b) => Number(b) - Number(a)
  );
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
      .map((s) => s.trim())
      .filter(Boolean);
    topics.forEach((t) => topicSet.add(t));
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

      const okYear = y === "all" || ny === y;
      const okTopic = t === "all" || nt.includes(t.toLowerCase());
      const okSearch = !q || text.includes(q);

      n.style.display = okYear && okTopic && okSearch ? "" : "none";
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
   Routing: load partials, init per-page scripts
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

  // page init
  if (route === "home") initHomeHighlights();
  if (route === "publications") initPublications();

  normalizeInPageAnchors(route);
  await scrollToSection(section);
  focusMain();
}

/* On hash change: close overlays + rerender */
window.addEventListener("hashchange", () => {
  closeMobileMenu();
  closeDesktopDropdowns();
  renderRoute();
});

/* Initial render */
renderRoute();

/* =========================
   Theme + Language system
   - default light (resolved)
   - stores mode (light/dark/system) in localStorage
========================= */
(function themeLang() {
  const root = document.documentElement;
  const KEY_THEME = "pref_theme_mode"; // light|dark|system
  const KEY_LANG = "pref_lang"; // en|ar

  const get = (k, fallback) => {
    try {
      return localStorage.getItem(k) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const set = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  };

  function resolveTheme(mode) {
    const systemDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (mode === "system") return systemDark ? "dark" : "light";
    return mode === "dark" ? "dark" : "light";
  }

  function applyTheme(mode) {
    if (!mode) mode = "light"; // ✅ default light
    const resolved = resolveTheme(mode);
    root.setAttribute("data-theme", resolved);
    set(KEY_THEME, mode);

    document.querySelectorAll("[data-theme]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-theme") === mode);
    });
  }

  function applyLang(lang) {
    if (!lang) lang = "en";
    root.setAttribute("lang", lang);
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    set(KEY_LANG, lang);

    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });
  }

  // handle option clicks (works for both desktop dropdown and any future mobile settings)
  document.addEventListener("click", (e) => {
    const themeBtn = e.target.closest("[data-theme]");
    if (themeBtn) {
      applyTheme(themeBtn.getAttribute("data-theme"));
      return;
    }
    const langBtn = e.target.closest("[data-lang]");
    if (langBtn) {
      applyLang(langBtn.getAttribute("data-lang"));
      return;
    }
  });

  // init
  applyTheme(get(KEY_THEME, "light")); // ✅ default light
  applyLang(get(KEY_LANG, "en"));

  // update if system changes and mode is system
  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        const mode = get(KEY_THEME, "light");
        if (mode === "system") applyTheme("system");
      });
  }
})();

/* =========================
   Desktop dropdown wiring
   - Opening one closes the other
   - Opening either closes mobile menu (important!)
========================= */
(function dropdownWire() {
  // SETTINGS
  if (settingsBtn && settingsWrap) {
    settingsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // ✅ if mobile menu is open, close it so dropdown is not behind
      closeMobileMenu();
      // ✅ close social if open
      closeSocial();

      const open = settingsWrap.classList.toggle("is-open");
      settingsBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // SOCIAL
  if (socialBtn && socialWrap) {
    socialBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      closeMobileMenu();
      closeSettings();

      const open = socialWrap.classList.toggle("is-open");
      socialBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // outside click closes both
  document.addEventListener("click", (e) => {
    if (settingsWrap && settingsWrap.classList.contains("is-open")) {
      if (!settingsWrap.contains(e.target)) closeSettings();
    }
    if (socialWrap && socialWrap.classList.contains("is-open")) {
      if (!socialWrap.contains(e.target)) closeSocial();
    }
  });
})();

/* =========================
   Mobile <details> accordion
   - only one open at a time
   - close menu on link click
========================= */
(function mobileAccordion() {
  if (!mobileMenu) return;

  const groups = Array.from(mobileMenu.querySelectorAll("details.mobileGroup"));

  // only one open
  groups.forEach((d) => {
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      groups.forEach((other) => {
        if (other !== d) other.open = false;
      });
    });
  });

  // close menu when clicking any link inside it
  mobileMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      closeMobileMenu();
    });
  });

  // click outside closes mobile menu
  document.addEventListener("click", (e) => {
    if (!mobileMenu.classList.contains("is-open")) return;
    if (mobileMenu.contains(e.target)) return;
    if (menuBtn && menuBtn.contains(e.target)) return;
    closeMobileMenu();
  });
})();

/* =========================
   ESC closes everything
========================= */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  closeMobileMenu();
  closeDesktopDropdowns();
});
