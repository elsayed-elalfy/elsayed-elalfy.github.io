/* =========================
app.js (COMPLETE)
- Works with your existing index.html (no changes)
- Injects home.html into <main id="app">
- Simple hash routing (Home + placeholders)
- Mobile menu toggle + year
- Highlights rotator on Home
========================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const appEl = $("#app");
const yearEl = $("#year");
const menuBtn = $("#menuBtn");
const mobileMenu = $("#mobileMenu");

if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---- Mobile menu ---- */
function closeMobileMenu(){
  if(!mobileMenu || !menuBtn) return;
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuBtn.setAttribute("aria-expanded", "false");
}

function toggleMobileMenu(){
  if(!mobileMenu || !menuBtn) return;
  const open = mobileMenu.classList.toggle("is-open");
  mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

if (menuBtn){
  menuBtn.addEventListener("click", toggleMobileMenu);
}

window.addEventListener("hashchange", () => {
  closeMobileMenu();
  renderRoute();
});

/* ---- Routing ---- */
function getRoute(){
  const hash = (location.hash || "#home").replace("#", "");
  const [route, sub] = hash.split("/");
  return { route: route || "home", sub: sub || "" };
}

async function fetchPartial(file){
  // This works when served via a local server (recommended).
  // If it fails (file://), we fall back to embedded templates.
  try{
    const res = await fetch(file, { cache: "no-store" });
    if(!res.ok) throw new Error("fetch failed");
    return await res.text();
  }catch{
    return null;
  }
}

function homeFallbackTemplate(){
  // If you open index.html directly as file://, fetch may be blocked.
  // This fallback keeps the site working.
  return `
    <section class="section"><div class="card"><h2 class="h2">Home</h2><p class="muted">
      Could not load <strong>home.html</strong>. Please run a local server (e.g., VSCode Live Server),
      or ensure home.html exists at the project root.
    </p></div></section>
  `;
}

function simplePlaceholder(title, text){
  return `
    <section class="section">
      <div class="card">
        <h1 class="h1">${title}</h1>
        <p class="muted">${text}</p>
      </div>
    </section>
  `;
}

async function renderRoute(){
  const { route } = getRoute();

  // Default skeleton is in index.html; we replace it here.
  if(!appEl) return;

  if(route === "home"){
    const html = await fetchPartial("home.html");
    appEl.innerHTML = html ?? homeFallbackTemplate();
    initHomeHighlights(); // attach rotator if exists
    focusMain();
    return;
  }

  if(route === "research"){
    appEl.innerHTML = simplePlaceholder(
      "Research",
      "Add your Research pages here (Overview, Core Directions, Projects, Collaboration)."
    );
    focusMain();
    return;
  }

  if(route === "publications"){
    appEl.innerHTML = simplePlaceholder(
      "Publications",
      "Link Google Scholar / PURE here, or render selected publications."
    );
    focusMain();
    return;
  }

  if(route === "teaching"){
    appEl.innerHTML = simplePlaceholder(
      "Teaching",
      "Add Courses, Graduate Supervision, and Resources here."
    );
    focusMain();
    return;
  }

  if(route === "service"){
    appEl.innerHTML = simplePlaceholder(
      "Service",
      "Add Editorial Service, Committees, Talks & Events here."
    );
    focusMain();
    return;
  }

  // fallback
  location.hash = "#home";
}

function focusMain(){
  // Accessibility: move focus to main content after navigation
  if(appEl) appEl.focus({ preventScroll: true });
}

/* ---- Home: Highlights Rotator ---- */
const HOME_HIGHLIGHTS = [
  {
    img: "assets/highlights/h1.jpg",
    title: "Fellow — SDAIA–KFUPM Joint AI Research Center",
    text: "Research leadership and engagement in national AI initiatives.",
    link: "https://pure.kfupm.edu.sa/en/persons/elsayed-elalfy/"
  },
  {
    img: "assets/highlights/h2.jpg",
    title: "Senior Research Scholar — IRC for Intelligent Secure Systems",
    text: "Research contributions in intelligent secure analytics and deployable AI.",
    link: "#service/overview"
  },
  {
    img: "assets/highlights/h3.jpg",
    title: "Graduate Supervision",
    text: "MSc/PhD mentorship with publication-oriented research expectations.",
    link: "#teaching/supervision"
  }
];

let hlIndex = 0;
let hlTimer = null;

function setDots(i){
  $$(".hlDots .dot").forEach((d, idx) => d.classList.toggle("is-active", idx === i));
}

function renderHighlight(i){
  const item = HOME_HIGHLIGHTS[i];
  const img = $("#hlImg");
  const title = $("#hlItemTitle");
  const text = $("#hlItemText");
  const link = $("#hlItemLink");

  if(!img || !title || !text || !link) return;

  // fallback if highlight images not present yet
  img.onerror = () => { img.src = "assets/portrait.jpg"; };
  img.src = item.img;
  img.alt = item.title;

  title.textContent = item.title;
  text.textContent = item.text;
  link.href = item.link;

  setDots(i);
}

function startRotation(){
  stopRotation();
  hlTimer = setInterval(() => {
    hlIndex = (hlIndex + 1) % HOME_HIGHLIGHTS.length;
    renderHighlight(hlIndex);
  }, 6000);
}

function stopRotation(){
  if(hlTimer) clearInterval(hlTimer);
  hlTimer = null;
}

function initHomeHighlights(){
  // run only if home widgets exist
  if(!$("#hlImg")) return;

  hlIndex = 0;
  renderHighlight(0);
  startRotation();

  $$(".hlDots .dot").forEach(btn => {
    btn.addEventListener("click", () => {
      hlIndex = Number(btn.dataset.i);
      renderHighlight(hlIndex);
      startRotation();
    });
  });
}

/* ---- Start ---- */
renderRoute();
