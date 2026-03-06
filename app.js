/* app.js — cleaned and consolidated */

/* -------------------------
   Tiny DOM helpers
--------------------------*/
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from((root || document).querySelectorAll(sel));

/* -------------------------
   Top-level elements
--------------------------*/
const appEl = $("#app");
const yearEl = $("#year");
const menuBtn = $("#menuBtn");
const mobileMenu = $("#mobileMenu");

/* set year if element present */
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =========================
   Mobile menu open/close
   (close also collapses any open <details>)
   ========================= */
function closeMobileMenu() {
  if (!mobileMenu || !menuBtn) return;
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuBtn.setAttribute("aria-expanded", "false");

  // collapse any open detail groups
  mobileMenu.querySelectorAll("details[open]").forEach(d => (d.open = false));
}

function toggleMobileMenu() {
  if (!mobileMenu || !menuBtn) return;
  const open = mobileMenu.classList.toggle("is-open");
  mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

if (menuBtn) menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMobileMenu();
});

/* close mobile menu on hash change (navigation) */
window.addEventListener("hashchange", () => {
  closeMobileMenu();
  renderRoute();
});

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

function getRoute() {
  const hash = (location.hash || "#home").replace("#", "");
  const [route, sub] = hash.split("/");
  if (sub === "home") return route || "home";
  return route || "home";
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

/* Convert in-page anchors (#overview) to #route/overview so they work from other pages */
function normalizeInPageAnchors(route) {
  $$('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;
    if (!href.startsWith("#")) return;
    // Already in the form #route/section
    if (/^#[^/]+\/.+/.test(href)) return;
    // Convert plain #section to #<route>/section (but don't convert top-level #home)
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
   Publications helpers (keeps original logic)
   ========================= */
function initPublications(){
  const metricsEl = document.getElementById("pubMetricsData");
  if(metricsEl){
    try{
      const data = JSON.parse(metricsEl.textContent || "{}");
      const set = (key, val) => {
        const node = document.querySelector(`[data-metric="${key}"]`);
        if(!node) return;
        if(node.tagName.toLowerCase() === "a"){
          node.href = val || "#";
        }else{
          node.textContent = val ?? "—";
        }
      };
      set("citations", data.citations);
      set("hindex", data.hindex);
      set("i10index", data.i10index);
      set("scholarLink", data.scholarLink);
    }catch{}
  }

  const yearSel = document.getElementById("pubYear");
  const topicSel = document.getElementById("pubTopic");
  const searchEl = document.getElementById("pubSearch");
  const resetBtn = document.getElementById("pubReset");
  const items = Array.from(document.querySelectorAll(".pubItem"));

  if(!yearSel || !topicSel || !searchEl || !resetBtn || items.length === 0) return;

  // populate years and topics
  const years = Array.from(new Set(items.map(n => n.dataset.year).filter(Boolean)))
    .sort((a,b) => Number(b) - Number(a));
  for(const y of years){
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSel.appendChild(opt);
  }

  const topicSet = new Set();
  for(const n of items){
    const topics = (n.dataset.topics || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    topics.forEach(t => topicSet.add(t));
  }
  const topics = Array.from(topicSet).sort((a,b)=>a.localeCompare(b));
  for(const t of topics){
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    topicSel.appendChild(opt);
  }

  function applyFilter(){
    const y = yearSel.value;
    const t = topicSel.value;
    const q = (searchEl.value || "").trim().toLowerCase();

    for(const n of items){
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

  // Page-specific init
  if (route === "home") initHomeHighlights();
  if (route === "publications") initPublications();

  // Fix internal anchors and scroll to requested section
  normalizeInPageAnchors(route);
  await scrollToSection(section);

  // Accessibility focus
  focusMain();
}

/* Initial route render */
renderRoute();

/* =========================
   Settings, Theme and Language System
   - Single source of truth: pref_theme_mode & pref_lang in localStorage
   - data-theme attr on <html> will be "light" or "dark" (resolved)
   - pref_theme_mode stores "light" | "dark" | "system"
   ========================= */
(function settingsThemeLang() {
  const root = document.documentElement;
  const STORAGE_THEME_KEY = "pref_theme_mode";
  const STORAGE_LANG_KEY = "pref_lang";

  const get = (k, fallback = null) => {
    try { return localStorage.getItem(k) ?? fallback; } catch { return fallback; }
  };
  const set = (k, v) => {
    try { localStorage.setItem(k, v); } catch {}
  };

  /* Resolve and apply theme */
  function resolveTheme(mode) {
    const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (mode === "system") return systemDark ? "dark" : "light";
    return (mode === "dark") ? "dark" : "light";
  }

  function applyTheme(mode) {
    // mode is "light" | "dark" | "system"
    if (!mode) mode = "system";
    const resolved = resolveTheme(mode);
    root.setAttribute("data-theme", resolved);
    // store preference mode (not resolved) so "system" is preserved
    set(STORAGE_THEME_KEY, mode);

    // Mark active theme buttons (if present)
    document.querySelectorAll("[data-theme]").forEach(btn => {
      // data-theme attr on controls contains the mode ("light"|"dark"|"system")
      btn.classList.toggle("is-active", btn.getAttribute("data-theme") === mode);
    });
  }

  /* Language */
  function applyLang(lang) {
    if (!lang) lang = "en";
    root.setAttribute("lang", lang);
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    set(STORAGE_LANG_KEY, lang);

    document.querySelectorAll("[data-lang]").forEach(btn => {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });
  }

  /* Attach click handler for any [data-theme] and [data-lang] controls */
  document.addEventListener("click", (e) => {
    const themeBtn = e.target.closest("[data-theme]");
    if (themeBtn) {
      const mode = themeBtn.getAttribute("data-theme");
      applyTheme(mode);
      return;
    }
    const langBtn = e.target.closest("[data-lang]");
    if (langBtn) {
      const lang = langBtn.getAttribute("data-lang");
      applyLang(lang);
      return;
    }
  });

  // Apply saved preferences (or defaults)
  const savedTheme = get(STORAGE_THEME_KEY, "system");
  applyTheme(savedTheme);

  const savedLang = get(STORAGE_LANG_KEY, "en");
  applyLang(savedLang);

  // Listen to system changes — only act if user selected "system"
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      const currentMode = get(STORAGE_THEME_KEY, "system");
      if (currentMode === "system") applyTheme("system");
    });
  }
})();

/* =========================
   Settings dropdown (desktop) open/close and outside click
   ========================= */
(function settingsDropdownWire() {
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsWrap = settingsBtn?.closest(".navItem--settings");
  const settingsDropdown = document.getElementById("settingsDropdown");

  function closeSettings() {
    if (!settingsWrap) return;
    settingsWrap.classList.remove("is-open");
    settingsBtn?.setAttribute("aria-expanded", "false");
  }
  function toggleSettings(e) {
    if (!settingsWrap) return;
    const open = settingsWrap.classList.toggle("is-open");
    settingsBtn?.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (!settingsBtn) return;

  settingsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSettings();
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!settingsWrap) return;
    if (!settingsWrap.contains(e.target)) closeSettings();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSettings();
  });
})();

/* =========================
   Social dropdown (desktop) open/close and outside click
   ========================= */
(function socialDropdownWire() {
  const socialBtn = document.getElementById("socialBtn");
  const socialWrap = socialBtn?.closest(".navItem--social");

  if (!socialBtn) return;

  socialBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    socialWrap.classList.toggle("is-open");
  });

  document.addEventListener("click", (e) => {
    if (!socialWrap) return;
    if (!socialWrap.contains(e.target)) socialWrap.classList.remove("is-open");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") socialWrap?.classList.remove("is-open");
  });
})();

/* =========================
   Mobile <details> accordion + link wiring
   - ensures only one open at a time
   - closes menu on link click
   ========================= */
(function mobileDetailsAccordion() {
  if (!mobileMenu) return;

  // gather groups (details.mobileGroup)
  const groups = Array.from(mobileMenu.querySelectorAll("details.mobileGroup"));

  if (groups.length === 0) {
    // fallback: any <details> in mobileMenu
    groups.push(...Array.from(mobileMenu.querySelectorAll("details")));
  }

  // add toggle listener to each details
  groups.forEach((details) => {
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      // close any other open groups
      groups.forEach((d) => {
        if (d !== details) d.open = false;
      });
    });
  });

  // close menu and collapse details when clicking any mobile link
  mobileMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      // collapse any open details
      groups.forEach(d => (d.open = false));
      closeMobileMenu();
    });
  });

  // Also close mobile menu if user clicks outside the mobile menu area (desktop -> mobile safety)
  document.addEventListener("click", (e) => {
    // if mobileMenu is not open, skip
    if (!mobileMenu.classList.contains("is-open")) return;
    if (!mobileMenu.contains(e.target) && e.target !== menuBtn) {
      closeMobileMenu();
    }
  });
})();

/* -------------------------
   Accessibility: close overlays on Escape
--------------------------*/
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMobileMenu();
    // close settings/social handled separately by their modules via Escape listeners
  }
});

/* End of app.js */
