# Yacanto de Calamuchita — Landing de venta de lotes

Landing estática (HTML/CSS/JS, sin build) para la venta de **25 lotes de +1 ha**
en un fraccionamiento de 50 ha en Yacanto de Calamuchita, Córdoba.

- **Plano interactivo** dibujado con la **geometría real** del relevamiento (KMZ 2022).
- **Editorial natural premium**: Cormorant Garamond + Hanken Grotesque, paleta tierra/sierra.
- **WhatsApp** flotante + deep-links por lote, y **formulario gratis** (FormSubmit).
- 100% estático → ideal para **GitHub Pages**, costo cero.

---

## ✅ 1. Completá tus datos (un solo archivo)

Abrí **`assets/main.js`** y editá el bloque `CONFIG` arriba de todo:

```js
const CONFIG = {
  whatsapp: "5493540000000",          // tu nº: país+área+número, sin 0/15/espacios
  waMessage: "¡Hola! Me interesan...", // mensaje precargado
  formEmail: "CAMBIAR@EMAIL.com",      // email donde te llegan las consultas
  priceFrom: "USD —",                  // ej: "USD 18.000"
};
```

Eso actualiza automáticamente: todos los botones de WhatsApp, el precio del hero
y el destino del formulario. **No hay que tocar nada más.**

### El formulario (FormSubmit, gratis)
La **primera vez** que alguien envíe el formulario, FormSubmit te manda un mail
a `formEmail` para **activar** el reenvío (una sola vez). Desde ahí, cada consulta
te llega a tu casilla. No requiere cuenta ni backend. Alternativa equivalente:
[Web3Forms](https://web3forms.com) (cambiando el `action` del `<form>`).

---

## 🚀 2. Publicar en GitHub Pages (gratis)

```bash
# en esta carpeta (ya tiene git inicializado y un commit)
gh repo create yacanto-calamuchita --public --source=. --remote=origin --push
```

Luego en GitHub: **Settings → Pages → Branch: `main` / root → Save.**
En 1–2 minutos queda online en
`https://<tu-usuario>.github.io/yacanto-calamuchita/`.

> Sin `gh`: creá el repo a mano en github.com, y después:
> `git remote add origin <url>` · `git push -u origin main`.

### Dominio propio (opcional)
Si tenés un dominio (ej. `yacantolotes.com`): en **Settings → Pages → Custom domain**,
y creá un `CNAME` apuntando a `<tu-usuario>.github.io`. El archivo `CNAME` se genera solo.

---

## 🖼️ 3. Reemplazá las imágenes (importante)

Las fotos de paisaje son **placeholders de Unsplash** (ilustrativas, no son del loteo).
Para producción, subí **fotos reales / drone** del predio a `assets/img/` y reemplazá las
URLs en `index.html` (hay 2: el `hero__img` y la imagen de la sección "El lugar"),
más la `og:image`. Ideal: una toma aérea con el Champaquí de fondo.

---

## 🗺️ 4. Datos del plano

`assets/lots.js` se generó a partir del KMZ original. Si cambian las parcelas,
regenerá ese archivo (la geometría está proyectada a un viewBox SVG). Datos actuales:

- **25 lotes**, de **1,01 a 2,88 ha** (promedio 1,88 ha) · **47,1 ha** loteadas.
- Centro aprox.: `-32.12489, -64.71052`.

Revisá también en `index.html` las **distancias** a localidades (marcadas con
`data-edit`) y ajustá los km reales.

---

## Estructura

```
index.html        ← una sola página, todas las secciones
assets/styles.css ← sistema de diseño (tokens oklch, tipografía, layout)
assets/main.js    ← CONFIG + plano interactivo + animaciones
assets/lots.js    ← geometría real de los lotes (generado del KMZ)
.nojekyll         ← para que GitHub Pages sirva los assets tal cual
```

## Probar localmente

```bash
python3 -m http.server 8000
# abrí http://localhost:8000
```
