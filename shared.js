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

// ── Checkout ─────────────────────────────────────────────────
function pagarMP() {
  alert('🔗 Integración Mercado Pago\n\nSe conecta con el SDK de MP y las credenciales del cliente.');
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
  // Inyectar WA SVG en wa-float
  const waFloat = document.querySelector('.wa-float');
  if (waFloat) waFloat.innerHTML = WA_SVG;
});
