/* ============================================================
   ABERTURAS — SHARED JS
   Carrito persistente en localStorage + helpers compartidos
   ============================================================ */

const WA_NUMBER = '5491100000000';

// ── Carrito ──────────────────────────────────────────────────
let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
let idCounter = parseInt(localStorage.getItem('carritoIdCounter') || '0');

function saveCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  localStorage.setItem('carritoIdCounter', idCounter);
}

function agregarFijo({ id, icono, nombre, precio, unidad, qty }) {
  const ex = carrito.find(i => i.tipo === 'fijo' && i.productoId === id);
  if (ex) ex.qty += qty;
  else carrito.push({ _id: ++idCounter, tipo: 'fijo', productoId: id, icono, nombre, precio, unidad, qty });
  saveCarrito();
  actualizarCarritoUI();
}

function agregarMedida({ icono, nombre, detalle, qty }) {
  carrito.push({ _id: ++idCounter, tipo: 'medida', icono, nombre, detalle, qty });
  saveCarrito();
  actualizarCarritoUI();
}

function cambiarQtyCarrito(cid, d) {
  const item = carrito.find(i => i._id === cid);
  if (item) { item.qty = Math.max(1, item.qty + d); saveCarrito(); actualizarCarritoUI(); }
}

function eliminarItem(cid) {
  carrito = carrito.filter(i => i._id !== cid);
  saveCarrito(); actualizarCarritoUI();
}

function limpiarCarrito() {
  carrito = []; saveCarrito(); actualizarCarritoUI();
}

// ── Render carrito ───────────────────────────────────────────
function actualizarCarritoUI() {
  const total = carrito.filter(i => i.tipo === 'fijo').reduce((s, i) => s + i.precio * i.qty, 0);
  const tieneConsultas = carrito.some(i => i.tipo === 'medida');
  const totalItems = carrito.reduce((s, i) => s + i.qty, 0);

  const badge = document.getElementById('cart-badge');
  if (badge) {
    if (totalItems > 0) { badge.textContent = totalItems; badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');
  }

  const itemsEl = document.getElementById('cart-items');
  const emptyEl = document.getElementById('cart-empty');
  const footerEl = document.getElementById('cart-footer');
  const resumenEl = document.getElementById('cart-resumen');
  if (!itemsEl) return;

  if (carrito.length === 0) {
    emptyEl && (emptyEl.style.display = 'flex');
    footerEl && (footerEl.style.display = 'none');
    itemsEl.innerHTML = '';
    emptyEl && itemsEl.appendChild(emptyEl);
    return;
  }

  emptyEl && (emptyEl.style.display = 'none');
  footerEl && (footerEl.style.display = 'flex');

  itemsEl.innerHTML = carrito.map(item => `
    <div class="cart-item">
      <span class="cart-item-icon">${item.icono}</span>
      <div class="cart-item-info">
        <div class="cart-item-nombre">${item.nombre}</div>
        ${item.detalle ? `<div class="cart-item-detalle">${item.detalle}</div>` : ''}
        <span class="cart-item-tipo ${item.tipo}">${item.tipo === 'fijo' ? 'Precio fijo' : 'A medida · consulta'}</span>
        <div class="cart-item-bottom">
          ${item.tipo === 'fijo'
            ? `<div class="cart-item-precio">$${(item.precio * item.qty).toLocaleString('es-AR')}</div>`
            : `<div class="cart-item-precio consulta">Precio a confirmar</div>`}
          <div style="display:flex;align-items:center;gap:4px;">
            ${item.tipo === 'fijo' ? `
              <div class="cart-item-qty">
                <button class="cqty-btn" onclick="cambiarQtyCarrito(${item._id},-1)">−</button>
                <span class="cqty-num">${item.qty}</span>
                <button class="cqty-btn" onclick="cambiarQtyCarrito(${item._id},1)">+</button>
              </div>` : `<span style="font-size:12px;color:var(--gris-texto);">x${item.qty}</span>`}
            <button class="cart-item-remove" onclick="eliminarItem(${item._id})">✕</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  let html = '';
  if (total > 0) html += `<div class="cart-resumen-row"><span>Subtotal productos</span><span>$${total.toLocaleString('es-AR')}</span></div>`;
  if (tieneConsultas) html += `<div class="cart-consulta-notice">⚠ Tu carrito incluye productos a medida. Los precios se confirman tras la consulta.</div>`;
  if (total > 0) html += `<div class="cart-resumen-row total"><span>Total</span><span>$${total.toLocaleString('es-AR')}</span></div>`;
  if (resumenEl) resumenEl.innerHTML = html;

  const btnMP = footerEl && footerEl.querySelector('.btn-mp');
  if (btnMP) btnMP.style.display = carrito.some(i => i.tipo === 'fijo') ? 'flex' : 'none';
}

function toggleCart() {
  document.getElementById('cart-sidebar').classList.toggle('open');
  document.getElementById('cart-overlay').classList.toggle('open');
}
function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
}

// ── Checkout modal ───────────────────────────────────────────
function pagarMP() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('co-overlay').classList.add('open');
  document.getElementById('co-modal').classList.add('open');
  _coPaso(1);
}

function cerrarCheckout() {
  document.getElementById('co-overlay').classList.remove('open');
  document.getElementById('co-modal').classList.remove('open');
}

function _coPaso(n) {
  document.getElementById('co-paso-1').style.display = n === 1 ? 'block' : 'none';
  document.getElementById('co-paso-2').style.display = n === 2 ? 'block' : 'none';
  document.getElementById('co-paso-3').style.display = n === 3 ? 'block' : 'none';
  document.getElementById('co-dot-1').className = 'co-dot ' + (n === 1 ? 'active' : 'done');
  document.getElementById('co-dot-2').className = 'co-dot ' + (n === 2 ? 'active' : n === 3 ? 'done' : '');
}

function coSiguiente() {
  const nombre = document.getElementById('co-nombre').value.trim();
  const email  = document.getElementById('co-email').value.trim();
  const tel    = document.getElementById('co-tel').value.trim();
  if (!nombre || !email || !tel) { showToast('⚠ Completá todos los campos'); return; }

  const fijos = carrito.filter(i => i.tipo === 'fijo');
  const consultas = carrito.filter(i => i.tipo === 'medida');
  const total = fijos.reduce((s, i) => s + i.precio * i.qty, 0);

  document.getElementById('co-resumen').innerHTML =
    fijos.map(i => `
      <div class="co-item">
        <span>${i.icono} ${i.nombre} <small>x${i.qty}</small></span>
        <span>$${(i.precio * i.qty).toLocaleString('es-AR')}</span>
      </div>`).join('') +
    (consultas.length ? `<div class="co-item co-item-consulta">
        <span>📋 ${consultas.length} producto${consultas.length > 1 ? 's' : ''} a medida</span>
        <span style="font-size:12px;color:#b45309;">Precio a confirmar</span>
      </div>` : '') +
    `<div class="co-total-row"><span>Total</span><span>$${total.toLocaleString('es-AR')}</span></div>`;

  _coPaso(2);
}

function coVolver() { _coPaso(1); }

function irAMP() {
  const nombre = document.getElementById('co-nombre').value.trim();
  const email  = document.getElementById('co-email').value.trim();
  const tel    = document.getElementById('co-tel').value.trim();

  // Armar mensaje para Adrián
  let msg = `🛒 *Nuevo pedido — Omar Aberturas*\n\n`;
  msg += `👤 *Cliente:* ${nombre}\n`;
  msg += `📧 *Email:* ${email}\n`;
  msg += `📱 *Teléfono:* ${tel}\n\n`;
  msg += `*Productos:*\n`;
  carrito.forEach((item, i) => {
    msg += `${i + 1}. ${item.nombre}`;
    if (item.tipo === 'fijo') msg += ` x${item.qty} — $${(item.precio * item.qty).toLocaleString('es-AR')}`;
    else msg += ` (a medida · ${item.detalle || 'ver detalle'})`;
    msg += '\n';
  });
  const total = carrito.filter(i => i.tipo === 'fijo').reduce((s, i) => s + i.precio * i.qty, 0);
  if (total > 0) msg += `\n💰 *Total: $${total.toLocaleString('es-AR')}*`;
  msg += '\n\n_Pedido generado desde el sitio web_';

  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  _coPaso(3);
}

function irMP() {
  // Placeholder: reemplazar con URL real de preferencia MP cuando Adrián tenga credenciales
  window.open('https://www.mercadopago.com.ar/', '_blank');
  cerrarCheckout();
  limpiarCarrito();
}

function enviarWA() {
  if (!carrito.length) return;
  let msg = '¡Hola! Quiero consultar:\n\n';
  carrito.forEach((item, i) => {
    msg += `${i + 1}. *${item.nombre}*`;
    if (item.detalle) msg += `\n   📐 ${item.detalle}`;
    if (item.tipo === 'fijo') msg += `\n   💰 $${(item.precio * item.qty).toLocaleString('es-AR')} (x${item.qty})`;
    else msg += `\n   📋 Cantidad: ${item.qty} — Precio a consultar`;
    msg += '\n\n';
  });
  const total = carrito.filter(i => i.tipo === 'fijo').reduce((s, i) => s + i.precio * i.qty, 0);
  if (total > 0) msg += `*Subtotal: $${total.toLocaleString('es-AR')}*\n`;
  msg += '\n¿Me pueden confirmar disponibilidad? ¡Gracias!';
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Tabs ──────────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b, i) =>
    b.classList.toggle('active', (i === 0 && tab === 'fijos') || (i === 1 && tab === 'medida')));
  document.getElementById('tab-fijos')?.classList.toggle('active', tab === 'fijos');
  document.getElementById('tab-medida')?.classList.toggle('active', tab === 'medida');
}

// ── SVG WhatsApp ──────────────────────────────────────────────
const WA_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="white"/></svg>`;

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  actualizarCarritoUI();

  const waFloat = document.querySelector('.wa-float');
  if (waFloat) waFloat.innerHTML = WA_SVG;

  // Inyectar estilos del checkout
  const style = document.createElement('style');
  style.textContent = `
    .co-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:400; opacity:0; pointer-events:none; transition:opacity .3s; backdrop-filter:blur(3px); }
    .co-overlay.open { opacity:1; pointer-events:all; }
    .co-modal { position:fixed; top:50%; left:50%; transform:translate(-50%,-48%); width:100%; max-width:480px; background:white; border-radius:20px; box-shadow:0 24px 60px rgba(0,0,0,.18); z-index:401; opacity:0; pointer-events:none; transition:all .3s; }
    .co-modal.open { opacity:1; pointer-events:all; transform:translate(-50%,-50%); }
    .co-header { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 1.5rem; border-bottom:1px solid var(--gris-medio); }
    .co-steps { display:flex; align-items:center; gap:.75rem; }
    .co-dot { display:flex; align-items:center; gap:6px; font-family:'Nunito',sans-serif; font-size:13px; font-weight:700; color:var(--gris-texto); }
    .co-dot span { width:24px; height:24px; border-radius:50%; background:var(--gris-medio); color:var(--gris-texto); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:900; }
    .co-dot.active { color:var(--azul); }
    .co-dot.active span { background:var(--azul); color:white; }
    .co-dot.done span { background:#16a34a; color:white; }
    .co-step-line { width:28px; height:2px; background:var(--gris-medio); border-radius:2px; }
    .co-close { background:none; border:none; font-size:20px; color:var(--gris-texto); cursor:pointer; padding:4px 8px; border-radius:6px; transition:all .2s; }
    .co-close:hover { background:var(--gris-claro); color:var(--negro); }
    .co-body { padding:1.5rem; }
    .co-title { font-family:'Nunito',sans-serif; font-size:20px; font-weight:900; color:var(--negro); margin-bottom:.25rem; }
    .co-sub { font-size:13px; color:var(--gris-texto); margin-bottom:1.5rem; }
    .co-form { display:flex; flex-direction:column; gap:.875rem; margin-bottom:1.5rem; }
    .co-field { display:flex; flex-direction:column; gap:4px; }
    .co-field label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--gris-texto); }
    .co-field input { background:var(--gris-claro); border:1px solid var(--gris-medio); color:var(--negro); padding:10px 14px; font-family:'Nunito Sans',sans-serif; font-size:14px; border-radius:8px; outline:none; transition:all .2s; }
    .co-field input:focus { border-color:var(--azul); background:white; box-shadow:0 0 0 3px rgba(204,34,34,.1); }
    .co-btn-primary { width:100%; background:var(--azul); color:white; border:none; padding:13px; border-radius:8px; font-family:'Nunito',sans-serif; font-size:15px; font-weight:800; cursor:pointer; transition:all .2s; }
    .co-btn-primary:hover { background:var(--azul-oscuro); transform:translateY(-1px); }
    .co-item { display:flex; justify-content:space-between; align-items:center; padding:.75rem 0; border-bottom:1px solid var(--gris-medio); font-size:14px; color:var(--negro); font-weight:600; }
    .co-item small { color:var(--gris-texto); font-weight:400; margin-left:4px; }
    .co-item-consulta { color:var(--gris-texto); }
    .co-total-row { display:flex; justify-content:space-between; align-items:center; padding:.875rem 0 1.25rem; font-family:'Nunito',sans-serif; font-size:20px; font-weight:900; color:var(--negro); }
    .co-total-row span:last-child { color:var(--azul); }
    .co-btn-mp { width:100%; display:flex; align-items:center; justify-content:center; gap:10px; background:#009ee3; color:white; border:none; padding:14px; border-radius:8px; font-family:'Nunito',sans-serif; font-size:15px; font-weight:800; cursor:pointer; transition:all .2s; margin-bottom:.75rem; }
    .co-btn-mp:hover { background:#0077b5; transform:translateY(-1px); }
    .co-btn-mp svg { width:22px; height:22px; }
    .co-btn-back { width:100%; background:none; border:none; color:var(--gris-texto); font-family:'Nunito',sans-serif; font-size:14px; font-weight:700; cursor:pointer; padding:8px; transition:color .2s; }
    .co-btn-back:hover { color:var(--negro); }
    @media(max-width:520px) { .co-modal { max-width:100%; border-radius:20px 20px 0 0; top:auto; bottom:0; left:0; transform:translateY(100%); } .co-modal.open { transform:translateY(0); } }
  `;
  document.head.appendChild(style);

  // Inyectar HTML del modal de checkout
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="co-overlay" id="co-overlay" onclick="cerrarCheckout()"></div>
    <div class="co-modal" id="co-modal">
      <div class="co-header">
        <div class="co-steps">
          <div class="co-dot active" id="co-dot-1"><span>1</span> Tus datos</div>
          <div class="co-step-line"></div>
          <div class="co-dot" id="co-dot-2"><span>2</span> Confirmar</div>
        </div>
        <button class="co-close" onclick="cerrarCheckout()">✕</button>
      </div>

      <div class="co-body" id="co-paso-1">
        <div class="co-title">¿A nombre de quién es el pedido?</div>
        <div class="co-sub">Te contactamos para coordinar la entrega.</div>
        <div class="co-form">
          <div class="co-field"><label>Nombre completo *</label><input type="text" id="co-nombre" placeholder="Tu nombre y apellido"></div>
          <div class="co-field"><label>Email *</label><input type="email" id="co-email" placeholder="tu@email.com"></div>
          <div class="co-field"><label>Teléfono *</label><input type="tel" id="co-tel" placeholder="11 0000-0000"></div>
        </div>
        <button class="co-btn-primary" onclick="coSiguiente()">Continuar →</button>
      </div>

      <div class="co-body" id="co-paso-2" style="display:none;">
        <div class="co-title">Resumen del pedido</div>
        <div id="co-resumen"></div>
        <button class="co-btn-mp" onclick="irAMP()">
          <svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10" fill="#009ee3"/><path d="M7 14c.8-2.2 2.8-3.8 5-3.8s4.2 1.6 5 3.8" stroke="white" stroke-width="1.5" stroke-linecap="round"/><circle cx="9.5" cy="10" r="1" fill="white"/><circle cx="14.5" cy="10" r="1" fill="white"/></svg>
          Pagar con Mercado Pago
        </button>
        <button class="co-btn-back" onclick="coVolver()">← Volver</button>
      </div>

      <div class="co-body" id="co-paso-3" style="display:none; text-align:center;">
        <div style="font-size:52px; margin-bottom:1rem;">✅</div>
        <div class="co-title">¡Pedido enviado!</div>
        <div class="co-sub" style="margin-bottom:1.5rem;">Adrián recibió los detalles por WhatsApp. Completá el pago para confirmar tu compra.</div>
        <button class="co-btn-mp" onclick="irMP()">
          <svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10" fill="#009ee3"/><path d="M7 14c.8-2.2 2.8-3.8 5-3.8s4.2 1.6 5 3.8" stroke="white" stroke-width="1.5" stroke-linecap="round"/><circle cx="9.5" cy="10" r="1" fill="white"/><circle cx="14.5" cy="10" r="1" fill="white"/></svg>
          Ir a Mercado Pago
        </button>
        <button class="co-btn-back" onclick="cerrarCheckout(); limpiarCarrito();">Cerrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
});
