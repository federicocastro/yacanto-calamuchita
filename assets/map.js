/* ════════════════════════════════════════════════════════════
   Mapa satelital del loteo — Leaflet + Esri World Imagery (gratis)
   Dibuja los lotes reales (lat/lng) sobre la imagen satelital.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  function init() {
    var L = window.L, geo = window.LOTEO_GEO, el = document.getElementById("locMap");
    if (!L || !geo || !el) return;

    // WhatsApp desde CONFIG (si main.js ya corrió) o fallback
    var WA = (window.YACANTO_WA) || "5493517045640";

    var center = geo.center || [-32.1259, -64.7092];
    var map = L.map(el, {
      center: center, zoom: 16, scrollWheelZoom: false, zoomControl: true, attributionControl: true
    });
    map.on("click", function(){ map.scrollWheelZoom.enable(); });
    map.on("mouseout", function(){ map.scrollWheelZoom.disable(); });

    // Capas base
    var sat = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Imágenes &copy; Esri, Maxar, Earthstar Geographics" }
    );
    var labels = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, opacity: 0.9 }
    );
    var streets = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: "&copy; OpenStreetMap" }
    );
    var satGroup = L.layerGroup([sat, labels]);
    satGroup.addTo(map);

    var fmt = function (n) { return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

    // Lotes vendidos (compartido con main.js)
    var SOLD = new Set(window.SOLD_LOTS || []);

    // Estilos de marca
    var lotStyle = { color: "#c97a4a", weight: 1.5, opacity: 0.95, fillColor: "#e0a06a", fillOpacity: 0.18 };
    var soldStyle = { color: "#9aa0a0", weight: 1.2, opacity: 0.85, fillColor: "#3a3f3c", fillOpacity: 0.55 };
    var lotHover = { weight: 2.5, fillOpacity: 0.42 };
    var caminoStyle = { color: "#f0e8d8", weight: 3, opacity: 0.7, dashArray: "1 6", lineCap: "round" };
    var perimStyle = { color: "#ffffff", weight: 2, opacity: 0.8, dashArray: "6 6", fill: false };

    var lotLayer = L.geoJSON(geo, {
      filter: function (f) { return f.properties.kind === "lote"; },
      style: function (f) { return SOLD.has(f.properties.num) ? soldStyle : lotStyle; },
      onEachFeature: function (f, layer) {
        var p = f.properties;
        var sold = SOLD.has(p.num);
        layer.bindTooltip("Lote " + p.num + (sold ? " · VENDIDO" : " · " + fmt(p.area) + " ha"),
          { sticky: true, direction: "top", className: "lot-tt" + (sold ? " lot-tt--sold" : "") });
        if (sold) {
          var msgS = "¡Hola! Vi que el Lote " + p.num + " está vendido. ¿Qué lotes disponibles tenés en Yacanto de Calamuchita?";
          var waS = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msgS);
          layer.bindPopup(
            '<div class="map-pop map-pop--sold"><span class="map-pop__ey">Vendido</span>' +
            '<strong class="map-pop__num">Lote ' + p.num + '</strong>' +
            '<span class="map-pop__area">Este lote ya fue escriturado.</span>' +
            '<a class="map-pop__wa" target="_blank" rel="noopener" href="' + waS + '">Ver disponibles</a></div>'
          );
        } else {
          var msg = "¡Hola! Me interesa el Lote " + p.num + " (" + fmt(p.area) + " ha) en Yacanto de Calamuchita. ¿Me pasás info y precio?";
          var wa = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
          layer.bindPopup(
            '<div class="map-pop"><span class="map-pop__ey">Lote disponible</span>' +
            '<strong class="map-pop__num">Lote ' + p.num + '</strong>' +
            '<span class="map-pop__area">' + fmt(p.area) + ' ha · escritura inmediata</span>' +
            '<a class="map-pop__wa" target="_blank" rel="noopener" href="' + wa + '">Consultar por WhatsApp</a></div>'
          );
          layer.on("mouseover", function () { layer.setStyle(lotHover); });
          layer.on("mouseout", function () { lotLayer.resetStyle(layer); });
        }
      }
    }).addTo(map);

    // Leyenda
    var legend = L.control({ position: "bottomleft" });
    legend.onAdd = function () {
      var d = L.DomUtil.create("div", "map-legend");
      d.innerHTML = '<span class="map-legend__i"><i class="sw sw--ok"></i>Disponible</span>' +
                    '<span class="map-legend__i"><i class="sw sw--sold"></i>Vendido</span>';
      return d;
    };
    legend.addTo(map);

    L.geoJSON(geo, { filter: function (f) { return f.properties.kind === "perim"; }, style: perimStyle }).addTo(map);
    L.geoJSON(geo, { filter: function (f) { return f.properties.kind === "camino"; }, style: caminoStyle }).addTo(map);

    // Encuadrar a los lotes
    function frame(){ try { map.invalidateSize(); map.fitBounds(lotLayer.getBounds().pad(0.12)); } catch (e) {} }
    frame();
    // recalcular cuando la sección entra en viewport (evita tamaño 0 si arrancó oculta)
    if ("IntersectionObserver" in window) {
      var mio = new IntersectionObserver(function(en){ en.forEach(function(e){ if(e.isIntersecting){ frame(); } }); }, { threshold: 0.01 });
      mio.observe(el);
    }
    window.addEventListener("resize", frame, { passive: true });
    setTimeout(frame, 400);

    // Toggle satélite / mapa
    var toggle = document.getElementById("mapToggle");
    if (toggle) {
      toggle.hidden = false;
      toggle.addEventListener("click", function (e) {
        var btn = e.target.closest("button"); if (!btn) return;
        var base = btn.dataset.base;
        toggle.querySelectorAll("button").forEach(function (b) { b.classList.toggle("is-on", b === btn); });
        if (base === "sat") { map.removeLayer(streets); satGroup.addTo(map); }
        else { map.removeLayer(satGroup); streets.addTo(map); }
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
