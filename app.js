const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const appEl = $("#app");
const yearEl = $("#year");
const menuBtn = $("#menuBtn");
const mobileMenu = $("#mobileMenu");

if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Mobile menu */
function closeMobileMenu() {
  if (!mobileMenu || !menuBtn) return;
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuBtn.setAttribute("aria-expanded", "false");
}
function toggleMobileMenu() {
  if (!mobileMenu || !menuBtn) return;
  const open = mobileMenu.classList.toggle("is-open");
  mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
}
if (menuBtn) menuBtn.addEventListener("click", toggleMobileMenu);

window.addEventListener("hashchange", () => {
  closeMobileMenu();
  renderRoute();
});

/**
 * Hash format supported:
 *   #home
 *   #teaching
 *   #teaching/overview
 *   #teaching/courses
 *   #teaching/course-leadership
 * etc.
 */
function parseHash() {
  const raw = (location.hash || "#home").replace("#", "").trim();
  const [routePart, sectionPart] = raw.split("/");
  return {
    route: routePart || "home",
    section: sectionPart || "",
  };
}

function getRoute() {
  return parseHash().route;
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

/* Smooth-scroll to a section AFTER the partial loads */
function scrollToSection(sectionId) {
  if (!sectionId) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return;
  }

  // Wait one frame to ensure DOM is painted
  requestAnimationFrame(() => {
    const safeId = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(sectionId) : sectionId;
    const el = document.getElementById(sectionId) || document.querySelector(`#${safeId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // If section not found, fall back to top
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  });
}

/**
 * Optional: convert in-page links like href="#overview" inside teaching.html
 * to href="#teaching/overview" automatically, so they work from any route.
 */
function normalizeInPageAnchors(route) {
  // Only needed for pages with lots of internal anchors (e.g., teaching)
  // If you already set your links as #teaching/overview, you can delete this function.
  $$('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;

    // Ignore SPA routes already in the form #route/section
    if (/^#[^/]+\/.+/.test(href)) return;

    // Convert plain #section to #<route>/section
    // Example: #overview => #teaching/overview (when on teaching page)
    if (href.length > 1 && !href.includes("/")) {
      const section = href.slice(1);
      a.setAttribute("href", `#${route}/${section}`);
    }
  });
}

/* Highlights data */
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
    title: "Worskshop",
    text: "ML for Smart Mobility in MATLAB",
    link: "https://events.kfupm.edu.sa/event/247/page/416-workshops",
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

/* Routing */
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

  // Make sure internal anchors behave as #route/section (optional but handy)
  normalizeInPageAnchors(route);

  // Scroll to section if present (after content loads)
  scrollToSection(section);

  // Focus main container for accessibility
  focusMain();
}

renderRoute();

/* Tip:
   Set menu links like:
     Teaching -> href="#teaching"
     Teaching submenu:
       Overview -> href="#teaching/overview"
       Courses -> href="#teaching/courses"
       Course Leadership -> href="#teaching/course-leadership"
       Curriculum & Accreditation -> href="#teaching/curriculum-accreditation"
       Course & Lab Development -> href="#teaching/development"
       Mentoring & Supervision -> href="#teaching/mentoring"
       Continuing Education -> href="#teaching/continuing-ed"
*/
