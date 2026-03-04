const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const appEl = $("#app");
const yearEl = $("#year");
const menuBtn = $("#menuBtn");
const mobileMenu = $("#mobileMenu");

if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Mobile menu */
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
if (menuBtn) menuBtn.addEventListener("click", toggleMobileMenu);

window.addEventListener("hashchange", () => {
  closeMobileMenu();
  renderRoute();
});

function getRoute(){
  const hash = (location.hash || "#home").replace("#", "");
  const [route] = hash.split("/");
  return route || "home";
}

async function fetchPartial(file){
  try{
    const res = await fetch(file, { cache: "no-store" });
    if(!res.ok) throw new Error("fetch failed");
    return await res.text();
  }catch{
    return null;
  }
}

function focusMain(){
  if(appEl) appEl.focus({ preventScroll: true });
}

/* Highlights data */
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
    link: "#service"
  },
  {
    img: "assets/highlights/h3.jpg",
    title: "Graduate Supervision",
    text: "MSc/PhD mentorship with publication-oriented research expectations.",
    link: "#teaching"
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

/* Routing */
async function renderRoute(){
  const route = getRoute();
  if(!appEl) return;

  const map = {
    home: "home.html",
    research: "research.html",
    publications: "publications.html",
    teaching: "teaching.html",
    service: "service.html",
  };

  const file = map[route] || "home.html";
  const html = await fetchPartial(file);

  if(html){
    appEl.innerHTML = html;
  }else{
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

  if(route === "home") initHomeHighlights();
  focusMain();
}

renderRoute();
