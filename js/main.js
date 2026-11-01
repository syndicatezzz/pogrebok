/* ============ Погребок — анимации и логика ============ */

// Точка на карте: Петропавловская ул., 1, Ленинский район, Новосибирск
const LOCATION = {
  lat: 54.985022,
  lon: 82.863345,
  zoom: 17,
  address: "Петропавловская ул., 1, цокольный этаж",
};

document.addEventListener("DOMContentLoaded", () => {
  splitHeroTitle();
  initDecor();
  requestAnimationFrame(() => document.body.classList.add("loaded"));

  initPageTransitions();
  initHeader();
  initReveal();
  initLantern();
  initEmbers();
  initParallax();
  initCounters();
  initMenuTabs();
  initTilt();
  initHours();
  initMap();
  initForm();
});

// Каждая страница всегда открывается с самого верха (кроме ссылок на якорь, например #bron)
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
function toTop() {
  if (location.hash) return;
  window.scrollTo(0, 0);
  if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
  // если сайт открыт внутри другого окна (например, превью), поднимаем и его
  const top = document.body || document.documentElement;
  try { top.scrollIntoView({ block: "start", behavior: "instant" }); } catch (e) { top.scrollIntoView(true); }
}
toTop();
document.addEventListener("DOMContentLoaded", toTop);
window.addEventListener("load", () => { toTop(); setTimeout(toTop, 120); setTimeout(toTop, 500); });

// Возврат «назад» из кеша браузера не должен оставлять затемнение и старую прокрутку
window.addEventListener("pageshow", (e) => {
  if (e.persisted) { document.body.classList.remove("leaving"); toTop(); }
});

/* --- Буквы заголовка вылетают по очереди --- */
function splitHeroTitle() {
  const h1 = document.querySelector(".hero h1[data-split]");
  if (!h1) return;
  const text = h1.textContent.trim();
  h1.textContent = "";
  [...text].forEach((ch, i) => {
    const s = document.createElement("span");
    s.className = "letter";
    s.textContent = ch === " " ? " " : ch;
    s.style.animationDelay = `${0.35 + i * 0.07}s`;
    h1.appendChild(s);
  });
}

/* --- Декор: полоса прокрутки, фонари, свечи, бегущая строка, волна на кнопках --- */
function initDecor() {
  const progress = document.createElement("div");
  progress.className = "progress";
  document.body.appendChild(progress);
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  const pageHero = document.querySelector(".page-hero");
  if (pageHero) {
    const lanterns = document.createElement("div");
    lanterns.className = "lanterns";
    [
      { x: "7%", len: 90, dl: "0s", sw: "4.2s" },
      { x: "20%", len: 140, dl: "-1.4s", sw: "5.1s" },
      { x: "80%", len: 120, dl: "-2.2s", sw: "4.7s" },
      { x: "93%", len: 80, dl: "-.7s", sw: "3.9s" },
    ].forEach((l) => {
      const el = document.createElement("div");
      el.className = "hlantern";
      el.style.cssText = `--x:${l.x};--len:${l.len}px;--dl:${l.dl};--sw:${l.sw}`;
      el.innerHTML = "<b></b>";
      lanterns.appendChild(el);
    });
    pageHero.appendChild(lanterns);
  }

  document.querySelectorAll(".cta").forEach((cta) => {
    const row = document.createElement("div");
    row.className = "cta-candles";
    [
      ["5%", 64, 16], ["9%", 42, 12], ["13%", 30, 11],
      ["85%", 34, 12], ["89%", 58, 15], ["94%", 40, 12],
    ].forEach(([x, h, w], i) => {
      const c = document.createElement("span");
      c.className = "candle";
      c.style.cssText = `--x:${x};--h:${h}px;--w:${w}px;--dl:${-i * 0.37}s`;
      row.appendChild(c);
    });
    cta.appendChild(row);
  });

  document.querySelectorAll(".marquee-track").forEach((t) => (t.innerHTML += t.innerHTML));

  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => {
      const r = btn.getBoundingClientRect();
      const dot = document.createElement("span");
      dot.className = "ripple";
      dot.style.left = e.clientX - r.left + "px";
      dot.style.top = e.clientY - r.top + "px";
      btn.appendChild(dot);
      setTimeout(() => dot.remove(), 700);
    });
  });
}

/* --- Плавный переход между страницами --- */
function initPageTransitions() {
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.target === "_blank" || /^(https?:|tel:|mailto:)/.test(href)) return;
    a.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      document.body.classList.add("leaving");
      setTimeout(() => (window.location.href = href), 450);
    });
  });
}

/* --- Шапка и мобильное меню --- */
function initHeader() {
  const header = document.querySelector(".header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav");
  burger?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
}

/* --- Появление блоков при прокрутке --- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => io.observe(el));
}

/* --- Тёплый «фонарь» за курсором --- */
function initLantern() {
  const lantern = document.querySelector(".lantern");
  if (!lantern || matchMedia("(hover: none)").matches) return;
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
  (function loop() {
    cx += (x - cx) * 0.12;
    cy += (y - cy) * 0.12;
    lantern.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  })();
}

/* --- Искры от камина --- */
function initEmbers() {
  const canvas = document.getElementById("embers");
  if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  let w, h, dpr;
  const sparks = [];
  const count = innerWidth < 700 ? 28 : 60;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
  }
  function spawn(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + Math.random() * 40 * dpr,
      r: (Math.random() * 1.8 + 0.6) * dpr,
      vy: (Math.random() * 0.6 + 0.25) * dpr,
      vx: (Math.random() - 0.5) * 0.3 * dpr,
      life: Math.random() * Math.PI * 2,
      hue: 22 + Math.random() * 22,
    };
  }
  resize();
  addEventListener("resize", resize);
  for (let i = 0; i < count; i++) sparks.push(spawn(true));

  (function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (const s of sparks) {
      s.life += 0.03;
      s.y -= s.vy;
      s.x += s.vx + Math.sin(s.life) * 0.35 * dpr;
      const alpha = 0.35 + Math.sin(s.life * 2) * 0.25;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
      g.addColorStop(0, `hsla(${s.hue}, 100%, 70%, ${alpha})`);
      g.addColorStop(1, `hsla(${s.hue}, 100%, 50%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
      ctx.fill();
      if (s.y < -20) Object.assign(s, spawn(false));
    }
    requestAnimationFrame(draw);
  })();
}

/* --- Параллакс фона --- */
function initParallax() {
  const bg = document.querySelector(".hero-bg");
  const photo = document.querySelector(".about-photo .img");
  if (!bg && !photo) return;
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      if (bg) bg.style.translate = `0 ${y * 0.35}px`;
      if (photo) {
        const rect = photo.parentElement.getBoundingClientRect();
        photo.style.translate = `0 ${(rect.top - innerHeight / 2) * -0.08}px`;
      }
      ticking = false;
    });
  }, { passive: true });
}

/* --- Счётчики в статистике --- */
function initCounters() {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const dur = 1800;
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  nums.forEach((n) => io.observe(n));
}

/* --- Вкладки меню --- */
function initMenuTabs() {
  const tabs = document.querySelectorAll(".menu-tab");
  if (!tabs.length) return;
  const groups = document.querySelectorAll(".menu-group");
  groups.forEach((g) => g.querySelectorAll(".menu-item").forEach((item, i) => item.style.setProperty("--i", i)));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      groups.forEach((g) => {
        const on = g.id === tab.dataset.target;
        g.classList.toggle("active", on);
        // перезапуск анимации пунктов
        if (on) g.querySelectorAll(".menu-item").forEach((it) => {
          it.style.animation = "none";
          void it.offsetWidth;
          it.style.animation = "";
        });
      });
      // Новая вкладка — всегда с начала списка
      const bar = document.querySelector(".menu-tabs");
      bar.style.scrollMarginTop = (document.querySelector(".header")?.offsetHeight || 0) + 16 + "px";
      bar.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  });
}

/* --- 3D-наклон карточек персонала --- */
function initTilt() {
  if (matchMedia("(hover: none)").matches) return;
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${px * 12}deg) rotateX(${-py * 12}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => (card.style.transform = ""));
  });
}

/* --- Подсветка сегодняшнего дня в часах работы --- */
function initHours() {
  const rows = document.querySelectorAll(".hours tr[data-day]");
  const today = new Date().getDay(); // 0 — воскресенье
  rows.forEach((r) => r.dataset.day.split(",").map(Number).includes(today) && r.classList.add("today"));
}

/* --- Карта: Яндекс, а если он недоступен (VPN, блокировка) — OpenStreetMap --- */
function initMap() {
  const el = document.getElementById("map");
  if (!el) return;
  const { lat, lon, zoom } = LOCATION;
  const widget = `https://yandex.ru/map-widget/v1/?ll=${lon},${lat}&z=${zoom}&pt=${lon},${lat},pm2orgl`;

  document.querySelectorAll("[data-ya-route]").forEach((a) => {
    a.href = `https://yandex.ru/maps/?rtext=~${lat},${lon}&rtt=auto`;
  });
  document.querySelectorAll("[data-ya-open]").forEach((a) => {
    a.href = `https://yandex.ru/maps/?ll=${lon},${lat}&z=${zoom}&pt=${lon},${lat},pm2orgl`;
  });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  // no-cors: ответ не читаем, важно только, что сервер Яндекса вообще отвечает
  fetch(widget, { mode: "no-cors", signal: ctrl.signal })
    .then(() => showYandexMap(el, widget))
    .catch(() => showFallbackMap())
    .finally(() => clearTimeout(timer));
}

function showYandexMap(el, src) {
  const iframe = document.createElement("iframe");
  iframe.title = "Погребок на Яндекс Картах";
  iframe.src = src;
  iframe.setAttribute("allowfullscreen", "");
  el.appendChild(iframe);
}

// Запасная карта лежит в самом сайте (assets/map.png — кусок OpenStreetMap вокруг кафе),
// поэтому работает даже там, где внешние серверы запрещены
function showFallbackMap() {
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "assets/leaflet/leaflet.css";
  document.head.appendChild(css);

  const script = document.createElement("script");
  script.src = "assets/leaflet/leaflet.js";
  script.onload = () => {
    const { lat, lon, zoom, address } = LOCATION;
    const bounds = [[54.97919, 82.8479], [54.991797, 82.875366]];
    const map = L.map("map", {
      center: [lat, lon],
      zoom,
      minZoom: 16,
      maxZoom: 18,
      maxBounds: bounds,
      maxBoundsViscosity: 1,
      scrollWheelZoom: false,
    });
    L.imageOverlay("assets/map.png", bounds, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    }).addTo(map);
    const icon = L.divIcon({
      className: "map-pin",
      html: "<span></span>",
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14],
    });
    L.marker([lat, lon], { icon })
      .addTo(map)
      .bindPopup(`<b>Погребок</b><br>${address}`)
      .openPopup();
  };
  document.head.appendChild(script);
}

/* --- Форма брони --- */
function initForm() {
  const form = document.querySelector("#booking");
  if (!form) return;
  const date = form.querySelector('input[type="date"]');
  if (date) date.min = new Date().toISOString().slice(0, 10);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.style.display = "none";
    document.querySelector(".form-done").classList.add("show");
  });
}
