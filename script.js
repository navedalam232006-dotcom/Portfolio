/* =========================================================
   JAVASCRIPT TOPICS COVERED
   variables, data types, arrays, objects, functions, arrow functions,
   loops, conditionals, DOM selection/manipulation, events,
   timers, Date, localStorage, form validation, regex,
   template literals, IntersectionObserver, canvas, classList, dataset
   ========================================================= */
"use strict";

// ---------- helper shortcuts (arrow functions) ----------
const $  = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// ---------- 1. Typing effect (arrays, setTimeout, string methods) ----------
const roles = ["Web Developer", "Student", "Problem Solver", "Designer"];
let roleIndex = 0, charIndex = 0, deleting = false;

function typeEffect() {
  const word = roles[roleIndex];
  const typedEl = $("#typed");
  typedEl.textContent = word.substring(0, charIndex);

  if (!deleting && charIndex < word.length) {
    charIndex++;
    setTimeout(typeEffect, 110);
  } else if (!deleting) {
    deleting = true;
    setTimeout(typeEffect, 1200);
  } else if (charIndex > 0) {
    charIndex--;
    setTimeout(typeEffect, 55);
  } else {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(typeEffect, 300);
  }
}
typeEffect();

// ---------- 2. Live clock (Date object, setInterval) ----------
function updateClock() {
  const now = new Date();
  $("#clock").textContent = now.toLocaleTimeString("en-IN");
  $("#clock").setAttribute("datetime", now.toISOString());
}
updateClock();
setInterval(updateClock, 1000);

// Footer year
$("#year").textContent = new Date().getFullYear();

// ---------- 3. Mobile menu toggle (classList) ----------
const navLinks = $("#navLinks");
$("#menuBtn").addEventListener("click", () => navLinks.classList.toggle("open"));
$$("#navLinks a").forEach(link =>
  link.addEventListener("click", () => navLinks.classList.remove("open"))
);

// ---------- 4. Dark mode with localStorage ----------
const themeBtn = $("#themeToggle");

function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeBtn.textContent = isDark ? "☀️" : "🌙";
}

// localStorage access wrapped in try/catch (can fail in private mode)
function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
}

applyTheme(safeGet("theme") === "dark");
themeBtn.addEventListener("click", () => {
  const goingDark = !document.body.classList.contains("dark");
  applyTheme(goingDark);
  safeSet("theme", goingDark ? "dark" : "light");
  drawChart(); // chart colors depend on theme
});

// ---------- 5. Scroll events: progress bar, back-to-top, active link ----------
const scrollBar = $("#scrollBar");
const topBtn = $("#topBtn");
const sections = $$("main section");

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  scrollBar.value = height > 0 ? (scrollTop / height) * 100 : 0;

  topBtn.classList.toggle("show", scrollTop > 400);

  // highlight nav link of the section currently in view
  let current = "";
  sections.forEach(sec => {
    if (scrollTop >= sec.offsetTop - 120) current = sec.id;
  });
  $$("#navLinks a").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
  });
});
topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ---------- 6. Reveal on scroll + animated counters (IntersectionObserver) ----------
function animateCount(el) {
  const target = Number(el.dataset.target);
  let value = 0;
  const step = Math.max(1, Math.ceil(target / 60));
  const timer = setInterval(() => {
    value += step;
    if (value >= target) { value = target; clearInterval(timer); }
    el.textContent = value;
  }, 25);
}

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      $$(".count", entry.target).forEach(animateCount);
      obs.unobserve(entry.target); // run once
    }
  });
}, { threshold: 0.15 });

$$(".reveal").forEach(sec => observer.observe(sec));

// ---------- 7. Project filter + modal (dataset, loops, dialog) ----------
const filterButtons = $$(".filter");
const cards = $$(".card");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const category = btn.dataset.filter;
    cards.forEach(card => {
      const show = category === "all" || card.dataset.category === category;
      card.classList.toggle("hide", !show);
    });
  });
});

const modal = $("#projectModal");
cards.forEach(card => {
  card.addEventListener("click", () => {
    $("#modalTitle").textContent = card.dataset.title;
    $("#modalDesc").textContent = card.dataset.desc;
    if (typeof modal.showModal === "function") modal.showModal();
  });
});
$("#modalClose").addEventListener("click", () => modal.close());
// close when clicking on the backdrop
modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });

// ---------- 8. Canvas skill chart (objects, arrays, loops, canvas API) ----------
const skillData = [
  { name: "HTML", value: 90, color: "#ff6584" },
  { name: "CSS",  value: 80, color: "#6c63ff" },
  { name: "JS",   value: 65, color: "#ffb703" },
  { name: "Python", value: 55, color: "#2a9d8f" }
];

function drawChart() {
  const canvas = $("#skillChart");
  const ctx = canvas.getContext("2d");
  const dark = document.body.classList.contains("dark");
  const textColor = dark ? "#ecebff" : "#22223b";
  const gridColor = dark ? "#333650" : "#e3e5f0";

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const left = 50, bottom = 220, chartHeight = 180;
  const barWidth = 70, gap = 60;

  // horizontal grid lines + labels
  ctx.font = "12px Segoe UI, Arial";
  ctx.textAlign = "right";
  for (let i = 0; i <= 100; i += 25) {
    const y = bottom - (i / 100) * chartHeight;
    ctx.strokeStyle = gridColor;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(canvas.width - 20, y);
    ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.fillText(i + "%", left - 8, y + 4);
  }

  // bars
  skillData.forEach((item, i) => {
    const x = left + 40 + i * (barWidth + gap);
    const h = (item.value / 100) * chartHeight;
    ctx.fillStyle = item.color;
    ctx.fillRect(x, bottom - h, barWidth, h);
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(item.name, x + barWidth / 2, bottom + 18);
    ctx.fillText(item.value + "%", x + barWidth / 2, bottom - h - 6);
  });
}
drawChart();

// ---------- 9. Contact form: validation, regex, events, localStorage ----------
const form = $("#contactForm");
const nameInput = $("#name");
const emailInput = $("#email");
const phoneInput = $("#phone");
const msgInput = $("#message");

// Regular expressions
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^[0-9]{10}$/;

// Validation functions: return an error string, or "" if OK
function validateName(v)  { return v.trim().length >= 3 ? "" : "Name must be at least 3 characters."; }
function validateEmail(v) { return emailRegex.test(v.trim()) ? "" : "Enter a valid email address."; }
function validatePhone(v) { return v === "" || phoneRegex.test(v) ? "" : "Phone must be exactly 10 digits."; }
function validateMsg(v)   { return v.trim().length >= 10 ? "" : "Message must be at least 10 characters."; }

// Show / clear the result for one field
function showResult(input, errorId, message) {
  $(errorId).textContent = message;
  input.classList.toggle("invalid", message !== "");
  input.classList.toggle("valid", message === "" && input.value !== "");
  return message === "";
}

// Live validation while typing
nameInput.addEventListener("input",  () => showResult(nameInput,  "#nameErr",  validateName(nameInput.value)));
emailInput.addEventListener("input", () => showResult(emailInput, "#emailErr", validateEmail(emailInput.value)));
phoneInput.addEventListener("input", () => showResult(phoneInput, "#phoneErr", validatePhone(phoneInput.value)));

// Character counter + range output
msgInput.addEventListener("input", () => {
  $("#charCount").textContent = msgInput.value.length;
  showResult(msgInput, "#msgErr", validateMsg(msgInput.value));
});
$("#budget").addEventListener("input", e => {
  $("#budgetOut").textContent = Number(e.target.value).toLocaleString("en-IN");
});

// Stored messages (JSON + localStorage)
function loadMessages() {
  try { return JSON.parse(safeGet("messages")) || []; } catch (e) { return []; }
}

function renderMessages() {
  const list = $("#messageList");
  const messages = loadMessages();
  list.innerHTML = ""; // clear

  if (messages.length === 0) {
    list.innerHTML = "<li>No messages yet.</li>";
    return;
  }
  messages.forEach(m => {
    const li = document.createElement("li");
    // template literal; textContent used for user text to avoid HTML injection
    const strong = document.createElement("strong");
    strong.textContent = `${m.name} (${m.role})`;
    const small = document.createElement("small");
    small.textContent = ` — ${m.time}`;
    const p = document.createElement("p");
    p.textContent = m.message;
    li.append(strong, small, p);
    list.appendChild(li);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault(); // stop page reload

  const okName  = showResult(nameInput,  "#nameErr",  validateName(nameInput.value));
  const okEmail = showResult(emailInput, "#emailErr", validateEmail(emailInput.value));
  const okPhone = showResult(phoneInput, "#phoneErr", validatePhone(phoneInput.value));
  const okMsg   = showResult(msgInput,   "#msgErr",   validateMsg(msgInput.value));
  const status = $("#formStatus");

  if (!(okName && okEmail && okPhone && okMsg)) {
    status.style.color = "#e63946";
    status.textContent = "Please fix the errors above.";
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  const messages = loadMessages();
  messages.push({
    name: data.name.trim(),
    role: data.role,
    message: data.message.trim(),
    time: new Date().toLocaleString("en-IN")
  });
  safeSet("messages", JSON.stringify(messages));

  status.style.color = "#2a9d8f";
  status.textContent = `Thanks ${data.name.trim()}! Your message was saved in this browser.`;
  form.reset();
  $("#charCount").textContent = 0;
  $("#budgetOut").textContent = "5,000";
  $$("input, textarea", form).forEach(el => el.classList.remove("valid", "invalid"));
  renderMessages();
});

form.addEventListener("reset", () => {
  $$(".error").forEach(el => (el.textContent = ""));
  $$("input, textarea", form).forEach(el => el.classList.remove("valid", "invalid"));
  $("#formStatus").textContent = "";
  $("#charCount").textContent = 0;
});

$("#clearMessages").addEventListener("click", () => {
  if (confirm("Delete all stored messages?")) {
    try { localStorage.removeItem("messages"); } catch (e) { /* ignore */ }
    renderMessages();
  }
});
renderMessages();

// ---------- 10. Visit counter (localStorage + number logic) ----------
const visits = (parseInt(safeGet("visits"), 10) || 0) + 1;
safeSet("visits", visits);
$("#visits").textContent = visits;

// ---------- 11. Keyboard shortcut (keyboard events) ----------
document.addEventListener("keydown", e => {
  if (e.key === "d" && e.altKey) themeBtn.click();  // Alt + D toggles dark mode
  if (e.key === "Escape" && modal.open) modal.close();
});

console.log("Portfolio loaded. Tip: press Alt + D to toggle dark mode.");