/* ════════════════════════════════════════════════════════════
   Galería + Lightbox — vanilla, accesible, con teclado y swipe
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  function init() {
    var grid = document.getElementById("galleryGrid");
    var lb = document.getElementById("lightbox");
    if (!grid || !lb) return;

    var figs = [].slice.call(grid.querySelectorAll(".gphoto"));
    var imgEl = document.getElementById("lbImg");
    var capEl = document.getElementById("lbCap");
    var countEl = document.getElementById("lbCount");
    var btnPrev = document.getElementById("lbPrev");
    var btnNext = document.getElementById("lbNext");
    var btnClose = document.getElementById("lbClose");
    var idx = 0;

    function show(i) {
      idx = (i + figs.length) % figs.length;
      var fig = figs[idx];
      var src = fig.querySelector("img").getAttribute("src");
      var alt = fig.querySelector("img").getAttribute("alt") || "";
      imgEl.style.opacity = "0";
      var pre = new Image();
      pre.onload = function () { imgEl.src = src; imgEl.alt = alt; imgEl.style.opacity = "1"; };
      pre.src = src;
      capEl.textContent = fig.getAttribute("data-cap") || "";
      countEl.textContent = (idx + 1) + " / " + figs.length;
    }
    function open(i) {
      show(i);
      lb.hidden = false;
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      requestAnimationFrame(function () { lb.classList.add("is-open"); });
      btnClose.focus();
    }
    function close() {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      setTimeout(function () { lb.hidden = true; }, 280);
      if (figs[idx]) figs[idx].querySelector("img").focus && figs[idx].focus();
    }

    figs.forEach(function (fig, i) {
      fig.setAttribute("tabindex", "0");
      fig.setAttribute("role", "button");
      fig.setAttribute("aria-label", "Ampliar foto: " + (fig.getAttribute("data-cap") || ""));
      fig.addEventListener("click", function () { open(i); });
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
      });
    });

    btnPrev.addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
    btnNext.addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
    btnClose.addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(idx - 1);
      else if (e.key === "ArrowRight") show(idx + 1);
    });

    // swipe (mobile)
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
