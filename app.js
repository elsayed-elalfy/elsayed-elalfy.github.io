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
 * Supported hash formats:
 *   #home
 *   #teaching
 *   #teaching/overview
 *   #teaching/curriculum-accreditation
 */
function parseHash() {
  const raw = (location.hash || "#home").replace("#", "").trim();
  const [routePart, sectionPart] = raw.split("/");
  return {
    route: (routePart || "home").toLowerCase(),
    section: (sectionPart || "").trim(),
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

/**
 * Wait until an element exists in the DOM (reliable on GitHub Pages).
 * Tries for up to `timeoutMs` using small intervals.
 */
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

/**
 * Scroll after content loads. Uses retries to avoid timing issues.
 * Also supports "top" when section is empty.
 */
async function scrollToSection(sectionId) {
  if (!sectionId) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return;
  }

  // Wait until the section actually exists
  const el = await waitForElementById(sectionId);

  if (!el) {
    // Not found (maybe typo in id) -> fallback to top
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return;
  }

  // Extra tiny delay helps in some layouts after innerHTML replace
  setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
}

/**
 * Optional but helpful:
 * If teaching.html contains href="#overview", convert it to href="#teaching/overview"
 * so it works even if clicked from another page.
 */
function normalizeInPageAnchors(route) {
  $$('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;

    // Already in the form #route/section
    if (/^#[^/]+\/.+/.test(href)) return;

    // Convert plain #section to #<route>/section
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



// added for publications

function initPublications(){
  // Metrics block
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

  // Filtering
  const yearSel = document.getElementById("pubYear");
  const topicSel = document.getElementById("pubTopic");
  const searchEl = document.getElementById("pubSearch");
  const resetBtn = document.getElementById("pubReset");
  const items = Array.from(document.querySelectorAll(".pubItem"));

  if(!yearSel || !topicSel || !searchEl || !resetBtn || items.length === 0) return;

  // Populate year options from items
  const years = Array.from(new Set(items.map(n => n.dataset.year).filter(Boolean)))
    .sort((a,b) => Number(b) - Number(a));
  for(const y of years){
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSel.appendChild(opt);
  }

  // Populate topic options from items
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
  // if (route === "home") initHomeHighlights();

if(route === "home") initHomeHighlights();
if(route === "publications") initPublications();
focusMain();

  // Fix internal anchors (optional)
  normalizeInPageAnchors(route);

  // IMPORTANT: scroll after load (reliable)
  await scrollToSection(section);

  // Accessibility
  focusMain();
}

renderRoute();
