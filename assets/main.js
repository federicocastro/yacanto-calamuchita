/* ════════════════════════════════════════════════════════════
   YACANTO DE CALAMUCHITA — main.js
   ► Editá SOLO el bloque CONFIG de abajo con tus datos reales.
   ════════════════════════════════════════════════════════════ */

const CONFIG = {
  // WhatsApp: código país + área + número, SIN signos, espacios ni 0/15.
  // Ej Córdoba cel: 54 9 351 123 4567  ->  "5493511234567"
  whatsapp: "5493517045640",

  // Mensaje precargado del botón de WhatsApp
  waMessage: "¡Hola! Me interesan los lotes en Yacanto de Calamuchita. ¿Me pasás info?",

  // Email donde te llegan los formularios (FormSubmit, 100% gratis).
  // La PRIMERA vez que alguien envíe, FormSubmit te manda un mail para activar.
  formEmail: "fmc0208@gmail.com",

  // Precio "desde" que se muestra en el hero. Ej: "USD 18.000"
  priceFrom: "USD 20.000 la hectárea",
};

/* ──────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Year ── */
  const yEl = $("#year"); if (yEl) yEl.textContent = new Date().getFullYear();

  /* ── Price ── */
  $$("[data-price]").forEach(el => {
    el.innerHTML = `Desde <strong>${CONFIG.priceFrom}</strong> · financiación a convenir`;
  });

  /* ── WhatsApp links ── */
  window.YACANTO_WA = CONFIG.whatsapp; // lo usa el mapa satelital (map.js)
  const waBase = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.waMessage)}`;
  $$("[data-wa]").forEach(a => { a.href = waBase; a.target = "_blank"; a.rel = "noopener"; });

  /* ── Form action ── */
  const form = $("#contactForm");
  if (form) form.setAttribute("action", `https://formsubmit.co/${CONFIG.formEmail}`);

  /* ── Nav scroll state ── */
  const nav = $("#nav");
  const onScroll = () => { if (nav) nav.classList.toggle("is-stuck", window.scrollY > window.innerHeight * 0.7); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── Hero parallax ── */
  const heroImg = $(".hero__img");
  if (heroImg && !reduce) {
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (y < window.innerHeight) heroImg.style.transform = `translateY(${y * 0.18}px) scale(1.04)`;
    }, { passive: true });
  }

  /* ── Reveal on scroll ── */
  const reveals = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(el => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const sibs = $$(".reveal", e.target.closest("section") || document);
          const idx = sibs.indexOf(e.target);
          e.target.style.transitionDelay = `${Math.min(idx, 6) * 70}ms`;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(el => io.observe(el));
  }

  /* ── Animated counters ── */
  const counters = $$("[data-count]");
  const animateCount = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    if (reduce) { el.textContent = target + suffix; return; }
    const dur = 1400; const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(el => cio.observe(el));
  } else counters.forEach(animateCount);

  /* ════ PLANO INTERACTIVO (geometría real del KMZ) ════ */
  const data = window.LOTEO;
  const svg = $("#planoSvg");
  if (data && svg) {
    const NS = "http://www.opengis.net/svg"; // unused, kept for clarity
    const SVGNS = "http://www.w3.org/2000/svg";
    svg.setAttribute("viewBox", data.viewBox.join(" "));

    const fmt = (n) => n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const elFromPts = (pts) => pts.map(p => p.join(",")).join(" ");

    // range labels
    const setTxt = (id, v) => { const e = $("#" + id); if (e) e.textContent = v; };
    setTxt("rangeMin", fmt(data.minHa)); setTxt("rangeMax", fmt(data.maxHa)); setTxt("rangeAvg", fmt(data.avgHa));

    // perimeter
    const gPerim = $("#planoPerim");
    (data.perim || []).forEach(ring => {
      const el = document.createElementNS(SVGNS, "polyline");
      el.setAttribute("points", elFromPts(ring));
      el.setAttribute("class", "perim");
      gPerim.appendChild(el);
    });
    // camino
    const gCam = $("#planoCamino");
    (data.camino || []).forEach(ring => {
      const el = document.createElementNS(SVGNS, "polyline");
      el.setAttribute("points", elFromPts(ring));
      el.setAttribute("class", "camino");
      gCam.appendChild(el);
    });

    // lots + labels
    const gLots = $("#planoLots");
    const gLabels = $("#planoLabels");
    const tip = $("#planoTip");
    const panelDefault = $("#panelDefault");
    const panelActive = $("#panelActive");
    let activeEl = null;

    const selNum = $("#selNum"), selArea = $("#selArea"), fLote = $("#f-lote");
    const waLotBtn = $("[data-wa-lot]");

    const selectLot = (lot, el) => {
      if (activeEl) activeEl.classList.remove("is-active");
      activeEl = el; el.classList.add("is-active");
      panelDefault.hidden = true; panelActive.hidden = false;
      selNum.textContent = lot.num;
      selArea.textContent = fmt(lot.area) + " ha";
      if (fLote) fLote.value = `Lote ${lot.num} (${fmt(lot.area)} ha)`;
      if (waLotBtn) {
        const msg = `¡Hola! Me interesa el Lote ${lot.num} (${fmt(lot.area)} ha) en Yacanto de Calamuchita. ¿Me pasás info y precio?`;
        waLotBtn.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
        waLotBtn.target = "_blank"; waLotBtn.rel = "noopener";
      }
    };
    const clearLot = () => {
      if (activeEl) activeEl.classList.remove("is-active");
      activeEl = null;
      panelActive.hidden = true; panelDefault.hidden = false;
      if (fLote) fLote.value = "—";
    };
    const clearBtn = $("#planoClear");
    if (clearBtn) clearBtn.addEventListener("click", clearLot);

    const moveTip = (evt, lot) => {
      const rect = svg.getBoundingClientRect();
      tip.style.left = (evt.clientX - rect.left) + "px";
      tip.style.top = (evt.clientY - rect.top) + "px";
      tip.innerHTML = `Lote ${lot.num} · <strong>${fmt(lot.area)} ha</strong>`;
      tip.hidden = false;
    };

    data.lots.forEach(lot => {
      const poly = document.createElementNS(SVGNS, "polygon");
      poly.setAttribute("points", elFromPts(lot.pts));
      poly.setAttribute("class", "lot");
      poly.setAttribute("tabindex", "0");
      poly.setAttribute("role", "button");
      poly.setAttribute("aria-label", `Lote ${lot.num}, ${fmt(lot.area)} hectáreas`);
      poly.addEventListener("mousemove", (e) => moveTip(e, lot));
      poly.addEventListener("mouseleave", () => { tip.hidden = true; });
      poly.addEventListener("click", () => selectLot(lot, poly));
      poly.addEventListener("focus", () => selectLot(lot, poly));
      poly.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectLot(lot, poly); } });
      gLots.appendChild(poly);

      const t = document.createElementNS(SVGNS, "text");
      t.setAttribute("x", lot.c[0]); t.setAttribute("y", lot.c[1]);
      t.setAttribute("class", "lot-label");
      t.textContent = lot.num;
      gLabels.appendChild(t);
    });

    // show labels once visible
    if ("IntersectionObserver" in window && !reduce) {
      const pio = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { svg.classList.add("show-labels"); pio.disconnect(); } });
      }, { threshold: 0.25 });
      pio.observe(svg);
    } else svg.classList.add("show-labels");
  }
})();
