/* app.js — routing + theme + language (i18n) + menus */

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

/* -------------------------
   i18n dictionary
   Add more keys as you tag more HTML with data-i18n
--------------------------*/
const I18N = {
  en: {
    "nav.home": "Home",
    "nav.research": "Research",
    "nav.publications": "Publications",
    "nav.teaching": "Teaching",
    "nav.service": "Service",
    "nav.overview": "Overview",
    "nav.themes": "Themes",
    "nav.projects": "Projects",
    "nav.collaboration": "Collaboration",
    "nav.journals": "Journal Articles",
    "nav.conferences": "Conference Papers",
    "nav.patents": "Patents",
    "nav.books": "Books & Chapters",
    "nav.reports": "Reports & Others",
    "nav.courses": "Courses",
    "nav.courseLeadership": "Course Leadership",
    "nav.curriculumAccred": "Curriculum & Accreditation",
    "nav.courseLabDev": "Course & Lab Development",
    "nav.mentoring": "Mentoring & Supervision",
    "nav.contEd": "Continuing Education",
    "nav.editorial": "Editorial",
    "nav.committees": "Committees",
    "nav.talks": "Talks & Events",

    "settings.button": "Settings",
    "settings.theme": "Theme",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.system": "System",
    "settings.language": "Language",

    "footer.copy": "Prof. El-Sayed M. El-Alfy — KFUPM",

    "home.role": "Professor of Computer Science & Engineering",
    "home.kfupm": "King Fahd University of Petroleum & Minerals",
    "home.ics": "Information and Computer Science Department",
    "home.coe": "Computer Engineering Department",
    "home.location": "Dhahran 31261, Saudi Arabia",
    "home.aff1Prefix": "Senior Research Scholar,",
    "home.aff1": "IRC for Intelligent Secure Systems",
    "home.aff2Prefix": "Guest Scholar, Former Fellow,",
    "home.aff2": "SDAIA–KFUPM Joint Research Center for AI",
    "home.emailLabel": "Email:",

    "home.visionTitle": "Advancing Trustworthy, Sustainable, Agentic and Human-Centered AI for Data-Driven Intelligent and Secure Systems",
    "home.visionLead": "My research advances reliable, scalable, trustworthy, privacy-preserving, agentic and secure intelligent systems designed for real-world deployment and critical-mission systems, with emphasis on:",

    "home.pill1": "Intelligent, Optimized, and Secure Data-Driven Systems",
    "home.pill2": "Trustworthy, Sustainable and Agentic AI",
    "home.pill3": "Multimodal and Federated Machine Learning",
    "home.pill4": "Cloud–Edge Intelligence Continuum",
    "home.pill5": "Robust Vision and Biometric Systems",
    "home.pill6": "Human Gestures, Sign Language and Affective Computing",

    "home.ctaResearch": "Explore Research",
    "home.ctaPubs": "Selected Publications",
    "home.ctaCv": "Download CV",

    "home.impactYears": "Years",
    "home.impactPubs": "Publications",
    "home.impactBooks": "Books",
    "home.impactPatents": "Patents",
    "home.impactCitations": "Citations, H-Index (Scholar)",
    "home.impactSupervision": "Graduate Supervision & Examination",

    "home.leadershipTitle": "Professional Leadership",
    "home.leadership1Strong": "Editorial Leadership:",
    "home.leadership1Text": "Editor-in-Chief, Journal of Data, Information and Management (Springer); Associate Editor and reviewer for leading international journals.",
    "home.leadership2Strong": "Funded Projects:",
    "home.leadership2Text": "Principal and co-investigator of several funded projects.",
    "home.leadership3Strong": "Professional Membership:",
    "home.leadership3Text": "Senior Member — IEEE; Member — APNNS; affiliations with ACM and AAAI.",
    "home.leadership4Strong": "Accreditation:",
    "home.leadership4Text": "ABET Program Evaluator (PEV); NCAAA Panel Reviewer.",

    "home.highlightsTitle": "Highlights",
    "home.highlightsTag": "Selected",
    "home.details": "Details",
  },

  ar: {
    "nav.home": "الرئيسية",
    "nav.research": "البحث",
    "nav.publications": "المنشورات",
    "nav.teaching": "التدريس",
    "nav.service": "الخدمة",
    "nav.overview": "نظرة عامة",
    "nav.themes": "المحاور",
    "nav.projects": "المشاريع",
    "nav.collaboration": "التعاون",
    "nav.journals": "مقالات المجلات",
    "nav.conferences": "أوراق المؤتمرات",
    "nav.patents": "براءات الاختراع",
    "nav.books": "الكتب والفصول",
    "nav.reports": "تقارير وأخرى",
    "nav.courses": "المقررات",
    "nav.courseLeadership": "قيادة المقررات",
    "nav.curriculumAccred": "المناهج والاعتماد",
    "nav.courseLabDev": "تطوير المقرر والمعمل",
    "nav.mentoring": "الإرشاد والإشراف",
    "nav.contEd": "التعليم المستمر",
    "nav.editorial": "التحرير",
    "nav.committees": "اللجان",
    "nav.talks": "محاضرات وفعاليات",

    "settings.button": "الإعدادات",
    "settings.theme": "السمة",
    "settings.light": "فاتح",
    "settings.dark": "داكن",
    "settings.system": "النظام",
    "settings.language": "اللغة",

    "footer.copy": "الأستاذ الدكتور السيد محمد الألفي — جامعة الملك فهد للبترول والمعادن",

    "home.role": "أستاذ علوم وهندسة الحاسب",
    "home.kfupm": "جامعة الملك فهد للبترول والمعادن",
    "home.ics": "قسم علوم الحاسب والمعلومات",
    "home.coe": "قسم هندسة الحاسب",
    "home.location": "الظهران 31261، المملكة العربية السعودية",
    "home.aff1Prefix": "باحث أول،",
    "home.aff1": "مركز الأبحاث متعدد التخصصات للأنظمة الذكية والآمنة",
    "home.aff2Prefix": "باحث زائر وزميل سابق،",
    "home.aff2": "مركز سدايا–جامعة الملك فهد المشترك للذكاء الاصطناعي",
    "home.emailLabel": "البريد:",

    "home.visionTitle": "النهوض بالذكاء الاصطناعي الموثوق والمستدام والوكيل والمرتكز على الإنسان للأنظمة الذكية والآمنة المعتمدة على البيانات",
    "home.visionLead": "تركّز أبحاثي على تطوير أنظمة ذكية موثوقة وقابلة للتوسع وتحافظ على الخصوصية وتمتلك قدرات وكيلية وآمنة، ومصممة للنشر الواقعي والمهام الحرجة، مع التركيز على:",

    "home.pill1": "أنظمة ذكية مُحسّنة وآمنة قائمة على البيانات",
    "home.pill2": "ذكاء اصطناعي موثوق ومستدام ووكيل",
    "home.pill3": "تعلم آلي متعدد الوسائط ومتحد (Federated)",
    "home.pill4": "تكامل السحابة–الحافة للذكاء",
    "home.pill5": "رؤية حاسوبية وأنظمة قياسات حيوية قوية",
    "home.pill6": "إيماءات الإنسان ولغة الإشارة والحوسبة الوجدانية",

    "home.ctaResearch": "استكشاف البحث",
    "home.ctaPubs": "منشورات مختارة",
    "home.ctaCv": "تحميل السيرة",

    "home.impactYears": "سنوات",
    "home.impactPubs": "منشورات",
    "home.impactBooks": "كتب",
    "home.impactPatents": "براءات",
    "home.impactCitations": "استشهادات، مؤشر h (جوجل سكولار)",
    "home.impactSupervision": "إشراف وفحص الدراسات العليا",

    "home.leadershipTitle": "القيادة المهنية",
    "home.leadership1Strong": "القيادة التحريرية:",
    "home.leadership1Text": "رئيس التحرير لمجلة البيانات والمعلومات والإدارة (سبرنغر)؛ ومحرر مشارك ومراجع لعدد من المجلات الدولية الرائدة.",
    "home.leadership2Strong": "مشاريع ممولة:",
    "home.leadership2Text": "باحث رئيسي/مشارك في عدة مشاريع ممولة.",
    "home.leadership3Strong": "العضويات المهنية:",
    "home.leadership3Text": "عضو أقدم في IEEE؛ وعضو في APNNS؛ وارتباطات مع ACM وAAAI.",
    "home.leadership4Strong": "الاعتماد:",
    "home.leadership4Text": "مقيّم برامج ABET (PEV)؛ ومراجع لجنة NCAAA.",

    "home.highlightsTitle": "أبرز الإنجازات",
    "home.highlightsTag": "مختارة",
    "home.details": "التفاصيل",
  }
};

/* -------------------------
   Preferences
--------------------------*/
const STORAGE_THEME_KEY = "pref_theme_mode"; // light | dark | system
const STORAGE_LANG_KEY = "pref_lang";        // en | ar

const getPref = (k, fallback) => {
  try { return localStorage.getItem(k) ?? fallback; } catch { return fallback; }
};
const setPref = (k, v) => {
  try { localStorage.setItem(k, v); } catch {}
};

/* -------------------------
   Year
--------------------------*/
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =========================
   Theme
========================= */
function resolveTheme(mode) {
  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  const systemDark = !!mq?.matches;
  if (mode === "system") return systemDark ? "dark" : "light";
  return mode === "dark" ? "dark" : "light";
}

function applyTheme(mode) {
  const resolved = resolveTheme(mode || "system");
  document.documentElement.setAttribute("data-theme", resolved);
  setPref(STORAGE_THEME_KEY, mode || "system");

  // highlight buttons
  document.querySelectorAll("[data-theme]").forEach(btn => {
    btn.classList.toggle("is-active", btn.getAttribute("data-theme") === (mode || "system"));
  });
}

/* =========================
   Language (RTL/LTR + i18n)
========================= */
function applyI18n(lang) {
  const safeLang = (lang === "ar") ? "ar" : "en";
  document.documentElement.setAttribute("lang", safeLang);
  document.documentElement.setAttribute("dir", safeLang === "ar" ? "rtl" : "ltr");
  setPref(STORAGE_LANG_KEY, safeLang);

  const dict = I18N[safeLang] || {};
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const val = dict[key];
    if (val) el.textContent = val;
  });

  // highlight language buttons
  document.querySelectorAll("[data-lang]").forEach(btn => {
    btn.classList.toggle("is-active", btn.getAttribute("data-lang") === safeLang);
  });
}

/* =========================
   Desktop dropdown wiring (settings/social)
   + IMPORTANT mobile fix:
   If mobile menu open, close it before opening dropdown.
========================= */
function isMobileViewport() {
  return window.matchMedia?.("(max-width: 900px)")?.matches ?? false;
}

function closeMobileMenu() {
  if (!mobileMenu || !menuBtn) return;
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuBtn.setAttribute("aria-expanded", "false");

  // collapse any open <details>
  mobileMenu.querySelectorAll("details[open]").forEach(d => (d.open = false));
}

function toggleMobileMenu() {
  if (!mobileMenu || !menuBtn) return;
  const open = mobileMenu.classList.toggle("is-open");
  mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

if (menuBtn) {
  menuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // closing settings/social if open (prevents overlay conflicts)
    closeSettingsDropdown();
    closeSocialDropdown();

    toggleMobileMenu();
  });
}

/* Settings dropdown */
const settingsBtn = $("#settingsBtn");
const settingsWrap = settingsBtn?.closest(".navItem--settings");

function closeSettingsDropdown() {
  if (!settingsWrap) return;
  settingsWrap.classList.remove("is-open");
  settingsBtn?.setAttribute("aria-expanded", "false");
}
function openSettingsDropdown() {
  if (!settingsWrap) return;
  settingsWrap.classList.add("is-open");
  settingsBtn?.setAttribute("aria-expanded", "true");
}

if (settingsBtn) {
  settingsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // mobile fix: close mobile menu first so dropdown isn't behind it
    if (isMobileViewport() && mobileMenu?.classList.contains("is-open")) {
      closeMobileMenu();
    }

    // close social to avoid both open
    closeSocialDropdown();

    const willOpen = !settingsWrap.classList.contains("is-open");
    if (willOpen) openSettingsDropdown(); else closeSettingsDropdown();
  });
}

/* Social dropdown */
const socialBtn = $("#socialBtn");
const socialWrap = socialBtn?.closest(".navItem--social");

function closeSocialDropdown() {
  if (!socialWrap) return;
  socialWrap.classList.remove("is-open");
  socialBtn?.setAttribute("aria-expanded", "false");
}
function openSocialDropdown() {
  if (!socialWrap) return;
  socialWrap.classList.add("is-open");
  socialBtn?.setAttribute("aria-expanded", "true");
}

if (socialBtn) {
  socialBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMobileViewport() && mobileMenu?.classList.contains("is-open")) {
      closeMobileMenu();
    }

    closeSettingsDropdown();

    const willOpen = !socialWrap.classList.contains("is-open");
    if (willOpen) openSocialDropdown(); else closeSocialDropdown();
  });
}

/* Outside click closes dropdowns */
document.addEventListener("click", (e) => {
  if (settingsWrap && !settingsWrap.contains(e.target)) closeSettingsDropdown();
  if (socialWrap && !socialWrap.contains(e.target)) closeSocialDropdown();

  // close mobile menu if clicking outside (when open)
  if (mobileMenu?.classList.contains("is-open")) {
    const clickedInsideMobile = mobileMenu.contains(e.target);
    const clickedMenuBtn = (menuBtn && (e.target === menuBtn || menuBtn.contains(e.target)));
    if (!clickedInsideMobile && !clickedMenuBtn) closeMobileMenu();
  }
});

/* Escape closes all overlays */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  closeSettingsDropdown();
  closeSocialDropdown();
  closeMobileMenu();
});

/* Theme/lang click handler (works for both desktop + mobile UIs) */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-theme]");
  if (t) {
    applyTheme(t.getAttribute("data-theme"));
    return;
  }
  const l = e.target.closest("[data-lang]");
  if (l) {
    applyI18n(l.getAttribute("data-lang"));

    // after changing language, re-apply translations in loaded partial
    // (needed because #app contents are already in DOM)
    applyI18n(getPref(STORAGE_LANG_KEY, "en"));
    return;
  }
});

/* System theme change if user selected system */
window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener?.("change", () => {
  const mode = getPref(STORAGE_THEME_KEY, "system");
  if (mode === "system") applyTheme("system");
});

/* =========================
   Mobile <details> accordion (only 1 open)
========================= */
(function mobileAccordion() {
  if (!mobileMenu) return;
  const groups = Array.from(mobileMenu.querySelectorAll("details.mobileGroup"));

  groups.forEach((d) => {
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      groups.forEach(other => { if (other !== d) other.open = false; });
    });
  });

  // close menu after clicking any mobile link
  mobileMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => closeMobileMenu());
  });
})();

/* =========================
   Routing helpers
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
  setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
}

function normalizeInPageAnchors(route) {
  $$('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;
    if (/^#[^/]+\/.+/.test(href)) return; // already normalized
    if (href.length > 1 && !href.includes("/")) {
      const section = href.slice(1);
      a.setAttribute("href", `#${route}/${section}`);
    }
  });
}

/* =========================
   Home highlights (unchanged, works with i18n)
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

  img.onerror = () => { img.src = "assets/portrait.jpg"; };
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
   Publications init (keep your original if needed)
========================= */
function initPublications() {
  // keep your previous publications init here (if you use it)
}

/* =========================
   renderRoute: load partial, init, apply i18n to new DOM
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
            Could not load <strong>${file}</strong>. Use a local server (e.g., VSCode Live Server).
          </p>
        </div>
      </section>
    `;
  }

  // init page code
  if (route === "home") initHomeHighlights();
  if (route === "publications") initPublications();

  // normalize anchors and scroll
  normalizeInPageAnchors(route);

  // IMPORTANT: apply translations to newly loaded content
  applyI18n(getPref(STORAGE_LANG_KEY, "en"));

  await scrollToSection(section);
  focusMain();
}

/* Hash navigation */
window.addEventListener("hashchange", () => {
  closeMobileMenu();
  closeSettingsDropdown();
  closeSocialDropdown();
  renderRoute();
});

/* Init preferences + first render */
applyTheme(getPref(STORAGE_THEME_KEY, "system"));
applyI18n(getPref(STORAGE_LANG_KEY, "en"));
renderRoute();
