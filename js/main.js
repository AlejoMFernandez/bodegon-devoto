// Bodegón Devoto · demo web
import { initKit } from '../kit/kit.js?v=1';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const q = new URLSearchParams(location.search);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => n == null ? 'Consultar' : '$' + Math.round(n).toLocaleString('es-AR');
const WA = '5491170961405';

/* =========================================================
   EL RELOJ DEL LOCAL (hora real de Buenos Aires)
   ?momento=noche|dia · ?hora=13 · ?dia=lun para probar
   ========================================================= */
const DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
const DIAS_LARGO = { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado', dom: 'Domingo' };
function ahora() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
  const map = { Sun: 'dom', Mon: 'lun', Tue: 'mar', Wed: 'mie', Thu: 'jue', Fri: 'vie', Sat: 'sab' };
  let h = Number(p.hour) + Number(p.minute) / 60;
  if (q.has('hora')) h = Number(q.get('hora'));
  const dia = DIAS.includes(q.get('dia')) ? q.get('dia') : map[p.weekday];
  return { h, dia, habil: !['sab', 'dom'].includes(dia) };
}
const T = ahora();
const abierto = T.h >= 12; // todos los días de 12 a 24
const noche = q.get('momento') === 'noche' || (q.get('momento') !== 'dia' && (T.h >= 19 || T.h < 6));
if (noche) html.classList.add('noche');

function pintarMomento() {
  const k = $('.hero__kicker');
  k.textContent = noche ? k.dataset.noche : k.dataset.dia;
  const img = $('#heroImg');
  if (noche) { img.src = img.dataset.noche; img.alt = 'El salón de noche, con luz cálida y las mesas llenas'; }
  const estado = abierto ? '<span class="punto"></span>Abierto ahora · hasta las 24' : 'Cerrado ahora · abrimos a las 12';
  const e1 = $('#estadoAbierto'); e1.innerHTML = estado; e1.classList.add('abierto');
  $('#estadoAbierto2').textContent = abierto ? 'Ahora abierto · cocina abierta todo el día' : 'Ahora cerrado · abrimos hoy a las 12';
  const card = $('#hoyCard');
  let k1, t1, s1;
  if (noche) { k1 = 'ESTA NOCHE'; t1 = 'Carta completa hasta las 24'; s1 = 'Milas, pastas, parrilla y postres'; }
  else if (T.habil && T.h >= 12 && T.h < 16) { k1 = 'HOY · HASTA LAS 16'; t1 = 'Menú del día $24.000'; s1 = 'Entrada, principal y postre o café'; }
  else if (!T.habil) { k1 = 'HOY · ' + DIAS_LARGO[T.dia].toUpperCase(); t1 = 'Mesa de finde'; s1 = 'Carta completa de 12 a 24'; }
  else if (T.h < 12) { k1 = 'HOY DESDE LAS 12'; t1 = 'Menú del día $24.000'; s1 = 'Entrada, principal y postre o café'; }
  else { k1 = 'MAÑANA DE 12 A 16'; t1 = 'Menú del día $24.000'; s1 = 'Hoy a la tarde: carta completa'; }
  card.innerHTML = `<span class="hoy-card__k">${k1}</span><b class="hoy-card__t">${t1}</b><span class="hoy-card__s">${s1}</span>`;
}
pintarMomento();

/* =========================================================
   INTRO · se levanta la campana
   ========================================================= */
function arrancarHero() { html.classList.add('listo'); }
function esperar(ms) { return new Promise(r => setTimeout(r, ms)); }
async function intro() {
  const el = $('#intro');
  if (!html.classList.contains('con-intro') || !el) { arrancarHero(); return; }
  const t0 = performance.now();
  const listos = Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    $('#heroImg').decode ? $('#heroImg').decode().catch(() => {}) : Promise.resolve(),
  ]);
  await esperar(750);
  el.classList.add('levanta');
  await esperar(560);
  await Promise.race([listos, esperar(Math.max(0, 2000 - (performance.now() - t0)))]);
  el.classList.add('sello');
  await esperar(640);
  html.classList.remove('con-intro');
  arrancarHero();
  el.classList.add('fuera');
  setTimeout(() => el.remove(), 500);
}
intro();

/* =========================================================
   ENTRADAS AL HACER SCROLL
   ========================================================= */
$$('.hero__texto > *').forEach((e, i) => e.style.setProperty('--d', i));
$$('.hero__titulo .linea > span').forEach((e, i) => e.style.setProperty('--d', i));
const grupos = new Map();
$$('.revela').forEach(e => { const p = e.parentElement; const n = grupos.get(p) || 0; e.style.setProperty('--d', n); grupos.set(p, n + 1); });
const io = new IntersectionObserver((ents) => ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); } }), { threshold: .18, rootMargin: '0px 0px -40px 0px' });
$$('.revela').forEach(e => io.observe(e));

/* barra: sombra, menú hamburguesa y sección activa */
const barra = $('#barra'), menu = $('#menu'), burger = $('#hamburguesa');
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => { barra.classList.toggle('scrolleada', scrollY > 10); ticking = false; });
}, { passive: true });
burger.addEventListener('click', () => {
  const on = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', on); menu.classList.toggle('abierto', on);
  burger.setAttribute('aria-label', on ? 'Cerrar menú' : 'Abrir menú');
});
menu.addEventListener('click', (e) => { if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); menu.classList.remove('abierto'); } });
const navLinks = $$('.barra__nav a[href^="#"]:not(.barra__nav-cta)');
const ioNav = new IntersectionObserver((ents) => ents.forEach(en => {
  if (!en.isIntersecting) return;
  navLinks.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
['hoy', 'carta', 'mila', 'mesa', 'llegar'].forEach(id => ioNav.observe(document.getElementById(id)));

/* =========================================================
   KIT: carta, comanda, reservas y panel
   ========================================================= */
const SALON = new Set(['cafeteria', 'tragos', 'medidas']);
const CAVA = ['malbec', 'cabernet-franc', 'cabernet-sauvignon', 'blend', 'blancos', 'rosados'];
const PAGINAS = [
  { id: 'cocina', nombre: 'Cocina', cats: ['entradas', 'especialidades', 'mila-ternera', 'mila-pollo', 'grillados', 'pastas', 'ensaladas', 'postres'] },
  { id: 'mediodia', nombre: 'Mediodía', cats: ['mediodia'] },
  { id: 'barra', nombre: 'Barra', cats: ['cafeteria', 'tragos', 'medidas', 'cervezas'] },
  { id: 'cava', nombre: 'Cava', cats: CAVA },
];
const DOS_COL = new Set(['cafeteria', 'tragos', 'medidas', 'cervezas']);
const FOTO_PAGINA = { cocina: ['img/carta/escalopes.webp', 'Escalopes de lomo al champignon'], mediodia: ['img/fotos/mesa-73.webp', 'La mesa puesta para el mediodía'], barra: ['img/fotos/vino-56.webp', 'Una copa de vino y algo dulce'], cava: ['img/fotos/vino-56.webp', 'Vino en la mesa, siempre'] };
const VAR_LAB = { xl: ['Normal', 'XL'], copa: ['Botella', 'Copa'], grande: ['Chica', 'Grande'], 700: ['350 g', '700 g'] };
const TAGS = { casa: ['De la casa', 'casa'], veggie: ['Sin carne', ''], comen2: ['Comen dos', ''], comen4: ['Comen cuatro', ''], nuevo: ['Nuevo', 'casa'], picante: ['Picante', ''] };
const NOTA_CAT = {
  'mila-ternera': 'Con guarnición a elección · normal o XL',
  'mila-pollo': 'Suprema con guarnición a elección · normal o XL',
  grillados: 'Con guarnición a elección',
  pastas: 'Con salsa clásica a elección',
  mediodia: 'Lunes a viernes de 12 a 16',
};
const pedible = (p) => !SALON.has(p.categoria) && !/__copa$/.test(p.id) && p.categoria !== 'semana';

function plantillaItem(p, ctx) {
  const nombre = /^(mila-ternera|mila-pollo)$/.test(p.categoria) ? p.nombre.split(' · ').pop() : p.nombre;
  const tags = (p.etiquetas || []).map(t => TAGS[t] ? `<span class="it-chip ${TAGS[t][1] ? 'it-chip--casa' : ''}">${TAGS[t][0]}</span>` : '').join('');
  const precio = ctx.money(p.precio) ?? 'Consultar';
  const accion = p.disponible === false ? '<span class="it-salon">Sin stock hoy</span>'
    : pedible(p) && p.precio != null ? `<div data-kit-qty="${esc(p.id)}"></div>`
    : SALON.has(p.categoria) || /__copa$/.test(p.id) ? '<span class="it-salon">En el salón</span>' : '';
  return `
    <div class="it-main">
      <h3 class="it-nombre">${p.foto ? '<span class="it-punto" aria-hidden="true"></span>' : ''}${esc(nombre)} ${tags}</h3>
      ${p.descripcion ? `<p class="it-desc">${esc(p.descripcion)}</p>` : ''}
      ${p.foto ? `<button type="button" class="it-foto" data-foto="${esc(ctx.asset(p.foto))}" data-nombre="${esc(nombre)}">Ver foto</button>` : ''}
    </div>
    <div class="it-lado"><span class="it-var" data-var="${esc(p.id)}"><small><b></b><span class="it-precio">${precio}</span></small>${accion}</span></div>`;
}

let kit = null;
let productos = [];
const prodMap = new Map();
const estadoCarta = { pagina: 'cocina' };

document.addEventListener('kit:carta', (e) => {
  const { el, productos: ps, categorias } = e.detail;
  productos = ps; prodMap.clear(); ps.forEach(p => prodMap.set(p.id, p));
  // variantes (XL, copa, grande, 700 g) en el mismo renglón que el plato base
  $$('.kit-item', el).forEach(it => {
    const id = it.dataset.id; const m = id.match(/^(.*)__(\w+)$/);
    if (!m) return;
    it.classList.add('es-variante');
    const base = el.querySelector(`.kit-item[data-id="${CSS.escape(m[1])}"]`);
    const v = it.querySelector('.it-var'); if (!base || !v) return;
    const lab = VAR_LAB[m[2]] || ['', m[2]];
    const lado = base.querySelector('.it-lado'); lado.classList.add('con-vars');
    lado.querySelector('.it-var b').textContent = lab[0] + ' ';
    v.querySelector('b').textContent = lab[1] + ' ';
    lado.appendChild(v);
  });
  $$('.it-lado:not(.con-vars) .it-var', el).forEach(v => { v.style.background = 'none'; v.style.padding = '0'; });
  // encabezado y pie de cada sección
  const cats = categorias.filter(c => c.id !== 'semana' && ps.some(p => p.categoria === c.id));
  const orden = cats.map(c => c.id);
  $$('.kit-carta__panel', el).forEach(panel => {
    const first = panel.querySelector('.kit-item'); if (!first) return;
    const cat = first.dataset.cat; panel.dataset.cat = cat;
    if (cat === 'semana') return;
    const c = categorias.find(x => x.id === cat) || { nombre: 'Otros' };
    const n = ps.filter(p => p.categoria === cat && !p.id.includes('__')).length;
    const nota = SALON.has(cat) ? 'Solo en el salón'
      : CAVA.includes(cat) ? 'Botellas para llevar · por copa en el salón'
      : (NOTA_CAT[cat] ? NOTA_CAT[cat] + ' · ' : '') + 'Se pide para llevar o con delivery';
    panel.classList.toggle('dos-col', DOS_COL.has(cat));
    panel.insertAdjacentHTML('afterbegin', `<header class="sec-cabeza"><h3>${esc(c.nombre)}</h3><p>${n} ${n === 1 ? 'opción' : 'opciones'} · ${esc(nota)}</p></header>`);
    const i = orden.indexOf(cat);
    const prev = cats[i - 1], next = cats[i + 1];
    panel.insertAdjacentHTML('beforeend', `<footer class="sec-pie">${prev ? `<button type="button" data-ir="${esc(prev.id)}">← ${esc(prev.nombre)}</button>` : '<span></span>'}${next ? `<button type="button" data-ir="${esc(next.id)}">${esc(next.nombre)} →</button>` : '<span></span>'}</footer>`);
  });
  pintarIndice(cats);
  pintarPizarron();
  pintarMila();
  pintarBandeja();
});

const kitCarta = $('#kitCarta');
function catActual() { const p = kitCarta.querySelector('.kit-carta__panel:not([hidden])'); return p?.dataset.cat; }
function paginaDe(cat) { return (PAGINAS.find(p => p.cats.includes(cat)) || PAGINAS[0]).id; }
function irA(cat, scroll) {
  const tab = $$('.kit-tab', kitCarta).find(t => t.dataset.cat === cat);
  if (tab) tab.click();
  const antes = estadoCarta.pagina;
  estadoCarta.pagina = paginaDe(cat);
  if (antes !== estadoCarta.pagina) fotoPagina();
  pintarIndice();
  if (scroll) {
    const top = $('#libro').getBoundingClientRect().top;
    if (top < 0) window.scrollTo({ top: scrollY + top - parseFloat(getComputedStyle(html).getPropertyValue('--barra')) - 10, behavior: reduce ? 'auto' : 'smooth' });
  }
}
let catsCache = [];
function pintarIndice(cats) {
  if (cats) catsCache = cats;
  const actual = catActual();
  if (actual) estadoCarta.pagina = paginaDe(actual);
  const extras = catsCache.filter(c => !PAGINAS.some(p => p.cats.includes(c.id))).map(c => c.id); // secciones nuevas del panel → Cocina
  $('#cartaPaginas').innerHTML = PAGINAS.map(p => `<button type="button" role="tab" class="pagina" data-pagina="${p.id}" aria-selected="${p.id === estadoCarta.pagina}">${p.nombre}</button>`).join('');
  const pag = PAGINAS.find(p => p.id === estadoCarta.pagina);
  const ids = [...pag.cats, ...(pag.id === 'cocina' ? extras : [])];
  $('#cartaSecciones').innerHTML = catsCache.filter(c => ids.includes(c.id)).map(c => {
    const n = productos.filter(p => p.categoria === c.id && !p.id.includes('__')).length;
    return `<button type="button" class="seccion-link" data-ir="${esc(c.id)}" ${c.id === actual ? 'aria-current="true"' : ''}><span>${esc(c.nombre)}</span><small>${n}</small></button>`;
  }).join('');
}
$('#cartaPaginas').addEventListener('click', (e) => {
  const b = e.target.closest('[data-pagina]'); if (!b) return;
  const pag = PAGINAS.find(p => p.id === b.dataset.pagina);
  const primera = catsCache.find(c => pag.cats.includes(c.id));
  if (primera) irA(primera.id, false);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-ir]'); if (!b) return;
  irA(b.dataset.ir, !!b.closest('.sec-pie') || innerWidth < 760);
});

function fotoPagina() {
  const [src, nom] = FOTO_PAGINA[estadoCarta.pagina] || FOTO_PAGINA.cocina;
  fotoImg.classList.add('cambiando');
  setTimeout(() => { fotoImg.src = src; fotoImg.onload = () => fotoImg.classList.remove('cambiando'); fotoNom.textContent = nom; }, 180);
}
/* foto del plato al pasar el mouse (caja fija) y "Ver foto" en el celu */
const fotoImg = $('#fotoPlato'), fotoNom = $('#fotoNombre');
let fotoPend = null, fotoRaf = 0;
kitCarta.addEventListener('pointerover', (e) => {
  const it = e.target.closest('.kit-item[data-photo]'); if (!it) return;
  fotoPend = it; if (fotoRaf) return;
  fotoRaf = requestAnimationFrame(() => {
    fotoRaf = 0; const src = fotoPend.dataset.photo;
    if (fotoImg.getAttribute('src') !== src) {
      fotoImg.classList.add('cambiando');
      const pre = new Image(); pre.src = src;
      pre.decode().catch(() => {}).then(() => { fotoImg.src = src; fotoImg.classList.remove('cambiando'); });
    }
    fotoNom.textContent = fotoPend.querySelector('.it-foto')?.dataset.nombre || '';
  });
});
const lb = $('#lightbox');
function lightbox(src, nombre) { $('#lightboxImg').src = src; $('#lightboxImg').alt = nombre; $('#lightboxPie').textContent = nombre; lb.hidden = false; $('.lightbox__x', lb).focus(); }
document.addEventListener('click', (e) => {
  const b = e.target.closest('.it-foto'); if (b) { lightbox(b.dataset.foto, b.dataset.nombre); return; }
  if (e.target.closest('[data-cerrar]')) lb.hidden = true;
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) lb.hidden = true; });

/* la carta de cuero se abre al llegar */
const libro = $('#libro');
new IntersectionObserver((ents, o) => ents.forEach(en => { if (en.isIntersecting) { libro.classList.add('abierto'); o.disconnect(); } }), { threshold: .22 }).observe(libro);

/* =========================================================
   ¿QUÉ COMEMOS HOY? · pizarrón editable desde el panel
   ========================================================= */
const HABILES = ['lun', 'mar', 'mie', 'jue', 'vie'];
let diaPiz = T.habil ? T.dia : 'lun';
function estadoHoy(dia) {
  if (dia !== T.dia) return `Así viene el ${DIAS_LARGO[dia].toLowerCase()}.`;
  if (T.h < 12) return 'Hoy se sirve de 12 a 16.';
  if (T.h < 16) return 'Se está sirviendo ahora, hasta las 16.';
  return T.dia === 'vie' ? 'Hoy ya terminó: vuelve el lunes a las 12.' : 'Hoy ya terminó: vuelve mañana a las 12.';
}
function pintarDias() {
  $('#dias').innerHTML = HABILES.map(d => `<button type="button" role="tab" class="dia" data-dia="${d}" aria-selected="${d === diaPiz}">${DIAS_LARGO[d].slice(0, 3).toUpperCase()}${d === T.dia ? '<span class="hoy-tag">HOY</span>' : ''}</button>`).join('');
}
function pintarPizarron() {
  const p = prodMap.get('semana-' + diaPiz);
  const partes = Object.fromEntries((p?.descripcion || '').split('·').map(s => s.split(':').map(x => x.trim())).filter(x => x.length === 2));
  const set = (id, v) => { const d = $(id); if (d.textContent !== v) { d.textContent = v; d.classList.remove('cambia'); void d.offsetWidth; d.classList.add('cambia'); } };
  $('#pizDia').textContent = p?.nombre || DIAS_LARGO[diaPiz];
  set('#pizE', partes.Entrada || '[A CONFIRMAR]');
  set('#pizP', partes.Principal || '[A CONFIRMAR]');
  set('#pizPo', partes.Postre || '[A CONFIRMAR]');
  const precio = prodMap.get('menu-del-dia')?.precio;
  if (precio) $('.pizarron__precio').textContent = money(precio);
  $('#hoyEstado').textContent = T.habil || diaPiz !== 'lun' ? estadoHoy(diaPiz) : 'El menú del día vuelve el lunes. Hoy: carta completa.';
}
pintarDias();
$('#dias').addEventListener('click', (e) => {
  const b = e.target.closest('[data-dia]'); if (!b) return;
  diaPiz = b.dataset.dia; pintarDias(); pintarPizarron();
});

/* =========================================================
   ELEGÍ TU MILA
   ========================================================= */
const SABORES = [
  ['la-simple', 'La simple', 'simple', 'img/carta/mila-simple.webp'],
  ['a-caballo', 'A caballo', 'a caballo', 'img/carta/milas.webp'],
  ['napo-completa', 'Napo completa', 'napo', 'img/carta/napo.webp'],
  ['cheddar-y-panceta', 'Cheddar y panceta', 'cheddar y panceta', 'img/carta/milas.webp'],
  ['al-roquefort', 'Al roquefort', 'al roquefort', 'img/carta/mila-simple.webp'],
  ['suiza', 'Suiza', 'suiza', 'img/carta/milas.webp'],
  ['fugazzeta', 'Fugazzeta', 'fugazzeta', 'img/carta/napo.webp'],
  ['con-hongos', 'Con hongos', 'con hongos', 'img/carta/milas.webp'],
];
const mila = { carne: 'mt', sabor: 'napo-completa', xl: false };
$('#sabores').innerHTML = SABORES.map(([k, n]) => `<button type="button" role="radio" class="sabor" data-sabor="${k}" aria-checked="${k === mila.sabor}">${n}</button>`).join('');
function pintarMila() {
  const s = SABORES.find(x => x[0] === mila.sabor);
  const id = `${mila.carne}-${mila.sabor}${mila.xl ? '__xl' : ''}`;
  const p = prodMap.get(id);
  $('#milaNombre').textContent = (mila.carne === 'mp' ? 'Suprema ' : 'Mila ') + s[1].toLowerCase() + (mila.xl ? ' XL' : '');
  $('#milaDesc').textContent = (p?.descripcion ? p.descripcion + ' ' : '') + 'Con guarnición a elección.';
  $('#milaPrecio').textContent = p ? money(p.precio) : '';
  const btn = $('#milaMarcha');
  btn.dataset.kitAdd = id;
  btn.disabled = !!p && p.disponible === false;
  btn.textContent = p?.disponible === false ? 'Hoy no hay' : `Marcha una ${mila.carne === 'mp' ? 'suprema ' : ''}${s[2]}${mila.xl ? ' XL' : ''}`;
  const img = $('#milaImg');
  if (!img.src.endsWith(s[3])) {
    img.classList.add('cambiando');
    setTimeout(() => { img.src = s[3]; img.alt = `Milanesa ${s[1].toLowerCase()}`; img.onload = () => img.classList.remove('cambiando'); }, 220);
  }
  $('#milaDisco').classList.toggle('xl', mila.xl);
  $('#milaXL').classList.toggle('on', mila.xl);
}
$('#sabores').addEventListener('click', (e) => {
  const b = e.target.closest('[data-sabor]'); if (!b) return;
  mila.sabor = b.dataset.sabor; $$('.sabor').forEach(x => x.setAttribute('aria-checked', x === b)); pintarMila();
});
$('.seg').addEventListener('click', (e) => {
  const b = e.target.closest('[data-carne]'); if (!b) return;
  mila.carne = b.dataset.carne; $$('.seg button').forEach(x => x.setAttribute('aria-checked', x === b)); pintarMila();
});
$('#xl').addEventListener('change', (e) => { mila.xl = e.target.checked; pintarMila(); });
pintarMila();

/* =========================================================
   ARMÁ LA MESA
   ========================================================= */
const PLATOS = [
  { k: 'bife', id: 'grillados-bife-de-chorizo-400-g', nombre: 'Bife de chorizo', tipo: 'principal' },
  { k: 'escalopes', id: 'especialidades-escalopes-de-lomo-al-champignon', nombre: 'Escalopes al champi', tipo: 'principal' },
  { k: 'mila', id: 'mt-la-simple', nombre: 'Mila simple', tipo: 'principal' },
  { k: 'burrata', id: 'entradas-burrata-siciliana', nombre: 'Burrata siciliana', tipo: 'entrada' },
  { k: 'panqueque', id: 'postres-panqueques-de-dulce-de-leche', nombre: 'Panqueques', tipo: 'postre' },
  { k: 'flan', id: 'postres-flan-casero-al-caramelo', nombre: 'Flan casero', tipo: 'postre' },
  { k: 'cheesecake', id: 'postres-cheesecake-nueva-york', nombre: 'Cheesecake', tipo: 'postre' },
  { k: 'volcan', id: 'postres-volcan-de-chocolate', nombre: 'Volcán', tipo: 'postre' },
];
const MAX_MESA = 12;
const tabla = $('#tabla'), bandeja = $('#bandeja');
let enMesa = []; // { uid, k, x, y, r }
function pintarBandeja() {
  bandeja.innerHTML = PLATOS.map(p => {
    const pr = prodMap.get(p.id); const off = pr && (pr.disponible === false || pr.precio == null);
    return `<button type="button" class="plato-btn" data-plato="${p.k}" ${off ? 'disabled' : ''} aria-label="Sumar ${esc(p.nombre)} a la mesa">
      <img src="img/platos/${p.k}.webp" alt="" width="420" height="420" loading="lazy" draggable="false"><b>${esc(p.nombre)}</b><span>${off ? 'Hoy no hay' : money(pr?.precio)}</span></button>`;
  }).join('');
}
pintarBandeja();
function cuentaMesa() {
  const ps = enMesa.map(m => PLATOS.find(p => p.k === m.k));
  const princ = ps.filter(p => p.tipo === 'principal').reduce((s, p) => s + ((prodMap.get(p.id)?.etiquetas || []).includes('comen2') ? 2 : 1), 0);
  const ent = ps.filter(p => p.tipo === 'entrada').length, post = ps.filter(p => p.tipo === 'postre').length;
  const total = ps.reduce((s, p) => s + (prodMap.get(p.id)?.precio || 0), 0);
  let txt;
  if (!ps.length) txt = 'La mesa está vacía';
  else if (!princ) txt = post && !ent ? 'Empezaron por el postre: falta el principal' : 'Falta el principal';
  else txt = `Comen ${princ}${ent ? `, pican ${princ + 1}` : ''}${post ? (post >= princ ? ' y llegan al postre' : '') : ''}`;
  const personas = Math.max(1, Math.min(12, princ + (ent ? 1 : 0)));
  $('#mesaComen').textContent = txt;
  $('#mesaTotal').textContent = money(total);
  $('#mesaMarcha').disabled = !ps.length;
  const r = $('#mesaReserva'); r.disabled = !princ; r.textContent = `Reservá para ${princ ? personas : 2}`; r.dataset.n = personas;
  $('#mesaVacia').hidden = !!ps.length;
}
function pintarMesa() {
  $$('.en-mesa', tabla).forEach(e => { if (!enMesa.some(m => m.uid === e.dataset.uid)) e.remove(); });
  enMesa.forEach(m => {
    let b = tabla.querySelector(`[data-uid="${m.uid}"]`);
    const p = PLATOS.find(x => x.k === m.k);
    if (!b) {
      b = document.createElement('button'); b.type = 'button'; b.className = 'en-mesa'; b.dataset.uid = m.uid;
      b.setAttribute('aria-label', `Sacar ${p.nombre} de la mesa`);
      b.innerHTML = `<img src="img/platos/${m.k}.webp" alt="" draggable="false"><span class="quitar" aria-hidden="true">×</span>`;
      b.style.setProperty('--r', m.r + 'deg');
      tabla.appendChild(b);
    }
    b.style.left = m.x * 100 + '%'; b.style.top = m.y * 100 + '%';
  });
  cuentaMesa();
}
function lugarLibre() {
  for (let i = 0; i < 40; i++) {
    const x = .14 + Math.random() * .72, y = .2 + Math.random() * .6;
    const w = tabla.clientWidth, h = tabla.clientHeight;
    if (enMesa.every(m => Math.hypot((m.x - x) * w, (m.y - y) * h) > 110)) return { x, y };
  }
  return { x: .2 + Math.random() * .6, y: .25 + Math.random() * .5 };
}
function sumarPlato(k, pos) {
  if (enMesa.length >= MAX_MESA) { $('#mesaComen').textContent = '¡No entra más nada en la mesa!'; return; }
  const p = pos || lugarLibre();
  enMesa.push({ uid: Math.random().toString(36).slice(2, 8), k, x: p.x, y: p.y, r: Math.round(Math.random() * 30 - 15) });
  pintarMesa();
}
function dentroDeTabla(cx, cy) {
  const r = tabla.getBoundingClientRect();
  if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return null;
  return { x: Math.min(.92, Math.max(.08, (cx - r.left) / r.width)), y: Math.min(.88, Math.max(.12, (cy - r.top) / r.height)) };
}
// arrastrar desde la bandeja o dentro de la mesa (pointer events: mouse y touch)
let drag = null;
function iniciarDrag(e, origen) {
  if (e.button > 0) return;
  drag = { origen, x0: e.clientX, y0: e.clientY, movio: false, ghost: null, id: e.pointerId };
  origen.el.setPointerCapture(e.pointerId);
}
bandeja.addEventListener('pointerdown', (e) => { const b = e.target.closest('.plato-btn:not(:disabled)'); if (b) iniciarDrag(e, { tipo: 'bandeja', k: b.dataset.plato, el: b }); });
tabla.addEventListener('pointerdown', (e) => { const b = e.target.closest('.en-mesa'); if (b) iniciarDrag(e, { tipo: 'mesa', uid: b.dataset.uid, el: b }); });
addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  if (!drag.movio && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
  if (!drag.movio) {
    drag.movio = true;
    const k = drag.origen.k || enMesa.find(m => m.uid === drag.origen.uid)?.k;
    drag.ghost = document.createElement('div'); drag.ghost.className = 'arrastrando';
    drag.ghost.innerHTML = `<img src="img/platos/${k}.webp" alt="">`; document.body.appendChild(drag.ghost);
    if (drag.origen.tipo === 'mesa') drag.origen.el.style.visibility = 'hidden';
  }
  drag.ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  drag.ghost.style.left = '0'; drag.ghost.style.top = '0';
  tabla.classList.toggle('encima', !!dentroDeTabla(e.clientX, e.clientY));
}, { passive: true });
function soltar(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag; drag = null; tabla.classList.remove('encima');
  d.ghost?.remove();
  const pos = dentroDeTabla(e.clientX, e.clientY);
  if (d.origen.tipo === 'bandeja') {
    if (!d.movio) sumarPlato(d.origen.k); else if (pos) sumarPlato(d.origen.k, pos);
  } else {
    const m = enMesa.find(x => x.uid === d.origen.uid);
    d.origen.el.style.visibility = '';
    if (!d.movio || !pos) enMesa = enMesa.filter(x => x !== m); // tocar o sacar de la mesa = levantar el plato
    else { m.x = pos.x; m.y = pos.y; }
    pintarMesa();
  }
}
addEventListener('pointerup', soltar);
addEventListener('pointercancel', (e) => { if (drag) { drag.ghost?.remove(); if (drag.origen.el) drag.origen.el.style.visibility = ''; drag = null; tabla.classList.remove('encima'); } });
bandeja.addEventListener('keydown', (e) => { const b = e.target.closest('.plato-btn'); if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); sumarPlato(b.dataset.plato); } });
tabla.addEventListener('keydown', (e) => { const b = e.target.closest('.en-mesa'); if (b && ['Enter', ' ', 'Delete', 'Backspace'].includes(e.key)) { e.preventDefault(); enMesa = enMesa.filter(m => m.uid !== b.dataset.uid); pintarMesa(); } });
$('#mesaLimpiar').addEventListener('click', () => { enMesa = []; pintarMesa(); });
$('#mesaMarcha').addEventListener('click', () => {
  if (!kit?.carrito) return;
  enMesa.forEach(m => kit.carrito.agregar(PLATOS.find(p => p.k === m.k).id));
  kit.carrito.abrir();
});
$('#mesaReserva').addEventListener('click', (e) => reservarPara(Number(e.currentTarget.dataset.n) || 2));
cuentaMesa();

/* reservas con la cantidad ya cargada */
function reservarPara(n) {
  if (!kit?.reservas) return;
  kit.reservas.abrir();
  requestAnimationFrame(() => {
    const pop = $$('.kit-pop--resv').pop(); if (!pop) return;
    const mas = pop.querySelector('[data-p="1"]'), menos = pop.querySelector('[data-p="-1"]');
    if (n > 2) for (let i = 2; i < n; i++) mas?.click();
    if (n < 2) menos?.click();
  });
}

/* =========================================================
   MAZO DE FOTOS
   ========================================================= */
const FOTOS = [
  ['mesa-60', 'La mesa perfecta se ve algo así.'],
  ['mesa-16', 'Mesa de domingo en el bodegón.'],
  ['milas-14', 'En toda mesa de bodegón siempre hay una milanesa.'],
  ['mesa-04', 'Para empezar: provoleta, empanada y buñuelos.'],
  ['napo-71', 'Milanesa napo XXXL, para compartir.'],
  ['tagliatelle-76', 'Tagliatelle al huevo con ragú de hongos.'],
  ['vino-56', 'Un buen plato y una copa de vino.'],
  ['ravioles-65', 'Domingo de pastas caseritas.'],
  ['mesa-29', 'Mesa para dos.'],
  ['empanada-78', 'Empanadas de carne cortadas a cuchillo.'],
  ['mesa-77', 'La mesa está servida.'],
  ['salon-61', 'Así se viven los mediodías en el bodegón.'],
];
const mazo = $('#mazo');
mazo.innerHTML = FOTOS.map(([f, c], i) => `<figure class="carta-foto" style="--r:${[-4, 3, -2, 5, -6, 2][i % 6]}deg;z-index:${FOTOS.length - i}"><img ${i < 3 ? 'src' : 'data-src'}="img/fotos/mazo/${f}.webp" alt="${esc(c)}" width="680" height="850" loading="lazy" decoding="async" draggable="false"><figcaption>${esc(c)}</figcaption></figure>`).join('');
let mazoOcupado = false;
function pasarFoto() {
  if (mazoOcupado) return; mazoOcupado = true;
  const cartas = $$('.carta-foto', mazo).sort((a, b) => b.style.zIndex - a.style.zIndex);
  const top = cartas[0];
  top.classList.add('sale');
  const pie = $('#mazoPie'); pie.style.opacity = 0;
  setTimeout(() => {
    cartas.forEach(c => { c.style.zIndex = Number(c.style.zIndex) + 1; });
    top.style.zIndex = 1; top.classList.remove('sale');
    pie.textContent = `"${cartas[1].querySelector('figcaption').textContent}"`; pie.style.opacity = 1;
    cartas.slice(1, 4).forEach(c => { const im = c.querySelector('img[data-src]'); if (im) { im.src = im.dataset.src; im.removeAttribute('data-src'); } });
    mazoOcupado = false;
  }, reduce ? 10 : 480);
}
$('#mazoSig').addEventListener('click', pasarFoto);
let mz = null;
mazo.addEventListener('pointerdown', (e) => { mz = { x: e.clientX }; });
mazo.addEventListener('pointerup', (e) => { if (mz && Math.abs(e.clientX - mz.x) > 50) pasarFoto(); else if (mz && Math.abs(e.clientX - mz.x) < 6) pasarFoto(); mz = null; });

/* =========================================================
   LA VIDRIERA: espiá el salón
   ========================================================= */
$('#espiar').addEventListener('click', (e) => {
  const v = $('#vidriera'); const on = !v.classList.contains('espia');
  v.classList.toggle('espia', on); e.currentTarget.setAttribute('aria-pressed', on);
  e.currentTarget.textContent = on ? 'Cerrar el visillo' : 'Espiá el salón';
});

/* =========================================================
   EL MOZO · mascota y chat
   ========================================================= */
const mozo = $('#mozo'), mozoBtn = $('#mozoBoton'), chat = $('#mozoChat'), globo = $('#mozoGlobo');
new IntersectionObserver(([en]) => { mozo.classList.toggle('visible', !en.isIntersecting); html.classList.toggle('pasa-hero', !en.isIntersecting); }, { threshold: .12 }).observe($('#hero'));
let caminaT = 0;
addEventListener('scroll', () => {
  if (reduce || !mozo.classList.contains('visible')) return;
  if (!mozo.classList.contains('camina')) mozo.classList.add('camina');
  clearTimeout(caminaT); caminaT = setTimeout(() => mozo.classList.remove('camina'), 180);
}, { passive: true });
let globoT = 0;
function decir(txt, ms = 2600) { globo.textContent = txt; globo.classList.add('on'); clearTimeout(globoT); globoT = setTimeout(() => globo.classList.remove('on'), ms); }
setTimeout(() => { if (mozo.classList.contains('visible') && chat.hidden) decir('¿Qué le traigo?', 3800); }, 9000);
document.addEventListener('kit:carrito', (e) => {
  const { producto, delta } = e.detail || {};
  if (!(delta > 0)) return;
  const pl = $('#mozoPlato');
  pl.style.backgroundImage = producto?.foto ? `url("${new URL(producto.foto, location.href).href}")` : '';
  pl.classList.remove('on'); void pl.offsetWidth; pl.classList.add('on');
  setTimeout(() => pl.classList.remove('on'), 1800);
  mozo.classList.remove('festeja'); void mozo.offsetWidth; mozo.classList.add('festeja');
  if (mozo.classList.contains('visible')) decir('¡Marchando!', 1600);
});

const PREGUNTAS = [
  ['abierto', '¿Están abiertos?'],
  ['donde', '¿Dónde quedan?'],
  ['menu', '¿Qué hay hoy de menú?'],
  ['delivery', '¿Hacen delivery?'],
  ['cubierto', '¿Cobran cubierto?'],
  ['reservar', 'Quiero reservar'],
  ['otra', 'Otra pregunta'],
];
function respuesta(k) {
  switch (k) {
    case 'abierto': return abierto ? 'Sí, estamos abiertos hasta las 24. La cocina está abierta todo el día.' : 'Ahora estamos cerrados. Abrimos todos los días a las 12 y cerramos a las 24.';
    case 'donde': return 'En Av. Chivilcoy 3818, Villa Devoto, a metros de plaza Arenales. <a href="https://www.google.com/maps/search/?api=1&query=Av.+Chivilcoy+3818,+Villa+Devoto,+CABA" target="_blank" rel="noopener">Abrir en Maps</a>';
    case 'menu': {
      if (!T.habil) return 'El menú del día es de lunes a viernes de 12 a 16. Hoy tenés la carta completa.';
      const p = prodMap.get('semana-' + T.dia);
      return `Hoy ${DIAS_LARGO[T.dia].toLowerCase()}: ${esc((p?.descripcion || '').replaceAll(' · ', ', '))}. ${money(prodMap.get('menu-del-dia')?.precio || 24000)}, de 12 a 16. <a href="#hoy">Ver el pizarrón</a>`;
    }
    case 'delivery': return 'Sí: delivery y para llevar. Armá tu comanda tocando <b>Marcha</b> en la carta y la mandás por WhatsApp o la pagás con Mercado Pago. El envío se coordina con el local. <a href="#carta">Ir a la carta</a>';
    case 'cubierto': return 'En el salón el cubierto es de $3.000 por persona. De lunes a viernes al mediodía no se cobra.';
    case 'reservar': setTimeout(() => { cerrarChat(); kit?.reservas?.abrir(); }, 700); return '¡Le guardo una mesa! Elija día y horario.';
    default: return `Eso se lo pregunto a la cocina. <a href="https://wa.me/${WA}?text=${encodeURIComponent('Hola Bodegón Devoto! Tengo una consulta:')}" target="_blank" rel="noopener">Escribinos por WhatsApp</a>`;
  }
}
function mensaje(txt, quien) {
  const m = document.createElement('p'); m.className = 'msg msg--' + quien; m.innerHTML = txt;
  $('#mozoMensajes').appendChild(m); m.scrollIntoView({ block: 'nearest' });
}
function abrirChat() {
  chat.hidden = false; mozoBtn.setAttribute('aria-expanded', 'true'); globo.classList.remove('on');
  if (!$('#mozoMensajes').children.length) mensaje('¡Buenas! Soy el mozo de Devoto. ¿Qué le traigo?', 'mozo');
  $('#mozoPreguntas').innerHTML = PREGUNTAS.map(([k, t]) => `<button type="button" data-preg="${k}">${t}</button>`).join('');
  $('#mozoX').focus();
}
function cerrarChat() { chat.hidden = true; mozoBtn.setAttribute('aria-expanded', 'false'); }
mozoBtn.addEventListener('click', () => chat.hidden ? abrirChat() : cerrarChat());
$('#mozoX').addEventListener('click', () => { cerrarChat(); mozoBtn.focus(); });
$('#mozoPreguntas').addEventListener('click', (e) => {
  const b = e.target.closest('[data-preg]'); if (!b) return;
  mensaje(esc(b.textContent), 'yo');
  setTimeout(() => mensaje(respuesta(b.dataset.preg), 'mozo'), 350);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !chat.hidden) cerrarChat(); });
document.addEventListener('click', (e) => { if (!chat.hidden && !e.target.closest('#mozo')) cerrarChat(); if (e.target.closest('#mozoMensajes a[href^="#"]')) cerrarChat(); });

/* =========================================================
   ARRANQUE DEL KIT
   ========================================================= */
const ICONO_CAMPANA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="1.4"/><path d="M4.5 16a7.5 7.5 0 0 1 15 0Z"/><path d="M2.5 19h19"/></svg>';
initKit({
  config: 'cliente.json',
  carta: { itemClass: 'item', template: plantillaItem },
  carrito: { label: 'Comanda', icono: ICONO_CAMPANA },
  badge: true,
}).then((ctx) => { kit = ctx; window.kit = ctx; }).catch((err) => console.error('[bodegón] kit', err));
