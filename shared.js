/* ============================================================
   ABERTURAS — SHARED JS
   Carrito (precio fijo) + consultas a medida (WA directo)
   ============================================================ */

const WA_NUMBER = localStorage.getItem('waNumber') || '5491122939621';
let _payMode = 'mp';

// ── Carrito (solo precio fijo) ────────────────────────────────
let carrito = JSON.parse(localStorage.getItem('carrito') || '[]').filter(i => i.tipo === 'fijo');
let idCounter = parseInt(localStorage.getItem('carritoIdCounter') || '0');

function saveCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  localStorage.setItem('carritoIdCounter', idCounter);
}

function agregarFijo({ id, icono, nombre, precio, unidad, qty }) {
  const ex = carrito.find(i => i.productoId === id);
  if (ex) ex.qty += qty;
  else carrito.push({ _id: ++idCounter, tipo: 'fijo', productoId: id, icono, nombre, precio, unidad, qty });
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
  const total = carrito.reduce((s, i) => s + i.precio * i.qty, 0);
  const totalItems = carrito.reduce((s, i) => s + i.qty, 0);

  const badge = document.getElementById('cart-badge');
  if (badge) {
    if (totalItems > 0) { badge.textContent = totalItems; badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');
  }

  const itemsEl  = document.getElementById('cart-items');
  const emptyEl  = document.getElementById('cart-empty');
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
        <div class="cart-item-bottom">
          <div class="cart-item-precio">$${(item.precio * item.qty).toLocaleString('es-AR')}</div>
          <div style="display:flex;align-items:center;gap:4px;">
            <div class="cart-item-qty">
              <button class="cqty-btn" onclick="cambiarQtyCarrito(${item._id},-1)">−</button>
              <span class="cqty-num">${item.qty}</span>
              <button class="cqty-btn" onclick="cambiarQtyCarrito(${item._id},1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="eliminarItem(${item._id})">✕</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  if (resumenEl) resumenEl.innerHTML = `
    <div class="cart-resumen-row"><span>Subtotal</span><span>$${total.toLocaleString('es-AR')}</span></div>
    <div class="cart-resumen-row total"><span>Total</span><span>$${total.toLocaleString('es-AR')}</span></div>
  `;
}

function toggleCart() {
  document.getElementById('cart-sidebar').classList.toggle('open');
  document.getElementById('cart-overlay').classList.toggle('open');
}
function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
}

// ── Checkout ──────────────────────────────────────────────────
function pagarMP() {
  _payMode = 'mp';
  _abrirCheckout();
}

function pagarTransferencia() {
  _payMode = 'transfer';
  _abrirCheckout();
}

function _abrirCheckout() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('co-overlay').classList.add('open');
  document.getElementById('co-modal').classList.add('open');

  const user = auth.currentUser;
  if (user) {
    const nombre = document.getElementById('co-nombre');
    const email  = document.getElementById('co-email');
    if (nombre && user.displayName) nombre.value = user.displayName;
    if (email  && user.email)       email.value  = user.email;
    _coPaso(1);
  } else {
    _coPaso(0);
  }
}

function cerrarCheckout() {
  document.getElementById('co-overlay').classList.remove('open');
  document.getElementById('co-modal').classList.remove('open');
}

function _coPaso(n) {
  ['co-paso-0', 'co-paso-1', 'co-paso-2-mp', 'co-paso-2-transfer', 'co-paso-3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const steps = document.getElementById('co-steps');
  if (n === 0) {
    document.getElementById('co-paso-0').style.display = 'block';
    if (steps) steps.style.visibility = 'hidden';
  } else if (n === 1) {
    if (steps) steps.style.visibility = '';
    document.getElementById('co-paso-1').style.display = 'block';
    document.getElementById('co-dot-1').className = 'co-dot active';
    document.getElementById('co-dot-2').className = 'co-dot';
  } else if (n === 2) {
    if (steps) steps.style.visibility = '';
    document.getElementById(_payMode === 'mp' ? 'co-paso-2-mp' : 'co-paso-2-transfer').style.display = 'block';
    document.getElementById('co-dot-1').className = 'co-dot done';
    document.getElementById('co-dot-2').className = 'co-dot active';
  } else if (n === 3) {
    if (steps) steps.style.visibility = '';
    document.getElementById('co-paso-3').style.display = 'block';
    document.getElementById('co-dot-1').className = 'co-dot done';
    document.getElementById('co-dot-2').className = 'co-dot done';
  }
}

function coSiguiente() {
  const nombre = document.getElementById('co-nombre').value.trim();
  const email  = document.getElementById('co-email').value.trim();
  const tel    = document.getElementById('co-tel').value.trim();
  if (!nombre || !email || !tel) { showToast('⚠ Completá todos los campos'); return; }

  const total = carrito.reduce((s, i) => s + i.precio * i.qty, 0);
  const resumenHTML = carrito.map(i =>
    `<div class="co-item"><span>${i.icono} ${i.nombre} <small>x${i.qty}</small></span><span>$${(i.precio * i.qty).toLocaleString('es-AR')}</span></div>`
  ).join('') + `<div class="co-total-row"><span>Total</span><span>$${total.toLocaleString('es-AR')}</span></div>`;

  if (_payMode === 'mp') {
    document.getElementById('co-resumen-mp').innerHTML = resumenHTML;
  } else {
    document.getElementById('co-resumen-transfer').innerHTML = resumenHTML;
    document.getElementById('co-transfer-total').textContent = `$${total.toLocaleString('es-AR')}`;
    const db = JSON.parse(localStorage.getItem('datosBancarios') || '{}');
    const filas = [
      ['Banco',            db.banco],
      ['Tipo de cuenta',   db.tipoCuenta],
      ['Número de cuenta', db.numeroCuenta],
      ['Sucursal',         db.sucursal],
      ['CBU',              db.cbu],
      ['Alias',            db.alias],
      ['Titular',          db.titular],
      ['CUIL/CUIT',        db.cuit],
      ['Referencia',       nombre],
    ].filter(([, v]) => v);
    document.getElementById('co-bank-box').innerHTML = filas.length > 1
      ? filas.map(([label, val]) => `<div class="co-bank-row"><span class="co-bank-label">${label}</span><span class="co-bank-val">${val}</span></div>`).join('')
      : `<div class="co-bank-row" style="color:#dc2626;font-size:13px;">⚠ Configurá los datos bancarios en el panel admin.</div>`;
  }
  _coPaso(2);
}

function coVolver() { _coPaso(1); }

function irAMP() {
  const nombre = document.getElementById('co-nombre').value.trim();
  const email  = document.getElementById('co-email').value.trim();
  const tel    = document.getElementById('co-tel').value.trim();
  const total  = carrito.reduce((s, i) => s + i.precio * i.qty, 0);

  let msg = `🛒 *Nuevo pedido — Omar Aberturas*\n\n`;
  msg += `👤 *Cliente:* ${nombre}\n📧 *Email:* ${email}\n📱 *Teléfono:* ${tel}\n\n*Productos:*\n`;
  carrito.forEach((item, i) => {
    msg += `${i + 1}. ${item.nombre} x${item.qty} — $${(item.precio * item.qty).toLocaleString('es-AR')}\n`;
  });
  msg += `\n💰 *Total: $${total.toLocaleString('es-AR')}*\n\n_Pedido generado desde el sitio web_`;

  const user = auth.currentUser;
  const guardarPedido = user
    ? db.collection('pedidos').add({
        userId:    user.uid,
        cliente:   nombre, email, tel,
        productos: carrito.map(i => `${i.nombre} x${i.qty}`).join(', '),
        total:     `$${total.toLocaleString('es-AR')}`,
        metodo:    'mercadopago',
        estado:    'pendiente',
        fecha:     firebase.firestore.FieldValue.serverTimestamp(),
      })
    : Promise.resolve();

  guardarPedido
    .then(() => {
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
      document.getElementById('co-paso3-title').textContent = '¡Pedido enviado!';
      document.getElementById('co-paso3-sub').textContent = 'Adrián recibió los detalles. Completá el pago en Mercado Pago para confirmar tu compra.';
      document.getElementById('co-paso3-btn-mp').style.display = 'flex';
      _coPaso(3);
    })
    .catch(() => {
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
      showToast('⚠ Te contactamos por WhatsApp, pero no pudimos registrar el pedido en el sistema — el vendedor lo va a cargar manualmente.');
    });
}

function irMP() {
  window.open('https://www.mercadopago.com.ar/', '_blank');
  cerrarCheckout();
  limpiarCarrito();
}

function irTransferWA() {
  const nombre = document.getElementById('co-nombre').value.trim();
  const email  = document.getElementById('co-email').value.trim();
  const tel    = document.getElementById('co-tel').value.trim();
  const total  = carrito.reduce((s, i) => s + i.precio * i.qty, 0);

  let msg = `🛒 *Pedido — Omar Aberturas*\n\n`;
  msg += `👤 *Cliente:* ${nombre}\n📧 *Email:* ${email}\n📱 *Teléfono:* ${tel}\n\n*Productos:*\n`;
  carrito.forEach((item, i) => {
    msg += `${i + 1}. ${item.nombre} x${item.qty} — $${(item.precio * item.qty).toLocaleString('es-AR')}\n`;
  });
  msg += `\n💰 *Total transferido: $${total.toLocaleString('es-AR')}*\n\n_Adjunto el comprobante de la transferencia._`;

  const user = auth.currentUser;
  const guardarPedido = user
    ? db.collection('pedidos').add({
        userId:    user.uid,
        cliente:   nombre, email, tel,
        productos: carrito.map(i => `${i.nombre} x${i.qty}`).join(', '),
        total:     `$${total.toLocaleString('es-AR')}`,
        metodo:    'transferencia',
        estado:    'pendiente',
        fecha:     firebase.firestore.FieldValue.serverTimestamp(),
      })
    : Promise.resolve();

  guardarPedido
    .then(() => {
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
      document.getElementById('co-paso3-title').textContent = '¡Comprobante enviado!';
      document.getElementById('co-paso3-sub').textContent = 'Adrián va a verificar la transferencia y te confirma el pedido a la brevedad.';
      document.getElementById('co-paso3-btn-mp').style.display = 'none';
      _coPaso(3);
    })
    .catch(() => {
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
      showToast('⚠ Te contactamos por WhatsApp, pero no pudimos registrar el pedido en el sistema — el vendedor lo va a cargar manualmente.');
    });
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
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${tab}'`) || false);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === 'tab-' + tab);
  });
}

// ── Auth clientes ─────────────────────────────────────────────

function toggleAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  if (modal.classList.contains('open')) {
    cerrarAuthModal();
  } else {
    const user = auth.currentUser;
    switchAuthView(user ? 'cuenta' : 'login');
    if (user) _cargarPedidosUsuario();
    modal.classList.add('open');
    document.getElementById('auth-overlay').classList.add('open');
  }
}

function cerrarAuthModal() {
  document.getElementById('auth-modal')?.classList.remove('open');
  document.getElementById('auth-overlay')?.classList.remove('open');
}

function switchAuthView(view) {
  ['login', 'registro', 'cuenta', 'reset'].forEach(v => {
    const el = document.getElementById(`auth-view-${v}`);
    if (el) el.style.display = v === view ? 'block' : 'none';
  });
  ['auth-err-login', 'auth-err-registro', 'auth-err-reset'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function authLogin() {
  const email = document.getElementById('auth-email').value.trim();
  const pass  = document.getElementById('auth-pass').value;
  const errEl = document.getElementById('auth-err-login');
  errEl.textContent = '';
  auth.signInWithEmailAndPassword(email, pass)
    .then(() => { cerrarAuthModal(); showToast('¡Bienvenido!'); })
    .catch(err => { errEl.textContent = _tradAuthError(err.code); });
}

function authRegistrar() {
  const nombre = document.getElementById('auth-nombre').value.trim();
  const email  = document.getElementById('auth-reg-email').value.trim();
  const pass   = document.getElementById('auth-reg-pass').value;
  const errEl  = document.getElementById('auth-err-registro');
  errEl.textContent = '';
  if (!nombre) { errEl.textContent = 'Ingresá tu nombre.'; return; }
  auth.createUserWithEmailAndPassword(email, pass)
    .then(cred => cred.user.updateProfile({ displayName: nombre }))
    .then(() => { cerrarAuthModal(); showToast('¡Cuenta creada!'); })
    .catch(err => { errEl.textContent = _tradAuthError(err.code); });
}

function authLogout() {
  auth.signOut().then(() => { cerrarAuthModal(); showToast('Sesión cerrada'); });
}

function authResetPassword() {
  const email = document.getElementById('auth-reset-email').value.trim();
  const errEl = document.getElementById('auth-err-reset');
  errEl.textContent = '';
  errEl.style.color = '#dc2626';
  auth.sendPasswordResetEmail(email)
    .then(() => { errEl.style.color = 'var(--verde)'; errEl.textContent = '¡Email enviado! Revisá tu bandeja de entrada.'; })
    .catch(err => { errEl.textContent = _tradAuthError(err.code); });
}

function switchCoAuth(view) {
  document.getElementById('co-auth-login').style.display    = view === 'login'    ? 'block' : 'none';
  document.getElementById('co-auth-registro').style.display = view === 'registro' ? 'block' : 'none';
  ['co-auth-err', 'co-auth-err-reg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function coAuthLogin() {
  const email = document.getElementById('co-auth-email').value.trim();
  const pass  = document.getElementById('co-auth-pass').value;
  const errEl = document.getElementById('co-auth-err');
  errEl.textContent = '';
  auth.signInWithEmailAndPassword(email, pass)
    .then(cred => {
      showToast('¡Bienvenido!');
      const nombre = document.getElementById('co-nombre');
      const emailF = document.getElementById('co-email');
      if (nombre && cred.user.displayName) nombre.value = cred.user.displayName;
      if (emailF) emailF.value = cred.user.email;
      _coPaso(1);
    })
    .catch(err => { errEl.textContent = _tradAuthError(err.code); });
}

function coAuthRegistrar() {
  const nombre = document.getElementById('co-auth-nombre').value.trim();
  const email  = document.getElementById('co-auth-reg-email').value.trim();
  const pass   = document.getElementById('co-auth-reg-pass').value;
  const errEl  = document.getElementById('co-auth-err-reg');
  errEl.textContent = '';
  if (!nombre) { errEl.textContent = 'Ingresá tu nombre.'; return; }
  auth.createUserWithEmailAndPassword(email, pass)
    .then(cred => cred.user.updateProfile({ displayName: nombre }).then(() => cred))
    .then(cred => {
      showToast('¡Cuenta creada!');
      const nombreF = document.getElementById('co-nombre');
      const emailF  = document.getElementById('co-email');
      if (nombreF) nombreF.value = nombre;
      if (emailF)  emailF.value  = email;
      _coPaso(1);
    })
    .catch(err => { errEl.textContent = _tradAuthError(err.code); });
}

function _cargarPedidosUsuario() {
  const listEl = document.getElementById('auth-orders-list');
  const infoEl = document.getElementById('auth-user-info');
  const user   = auth.currentUser;
  if (!listEl || !user) return;

  const nombre = user.displayName || user.email.split('@')[0];
  infoEl.innerHTML = `<div class="auth-user-name">${nombre}</div><div class="auth-user-email">${user.email}</div>`;
  listEl.innerHTML = '<div class="auth-orders-empty">Cargando...</div>';

  db.collection('pedidos').where('userId', '==', user.uid).get()
    .then(snap => {
      if (snap.empty) { listEl.innerHTML = '<div class="auth-orders-empty">Todavía no tenés pedidos.</div>'; return; }
      const docs = snap.docs
        .map(d => d.data())
        .sort((a, b) => {
          const fa = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha || 0);
          const fb = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha || 0);
          return fb - fa;
        })
        .slice(0, 10);
      listEl.innerHTML = docs.map(p => `
        <div class="auth-order-item">
          <div class="auth-order-top">
            <span class="auth-order-fecha">${p.fecha?.toDate ? p.fecha.toDate().toLocaleDateString('es-AR') : '—'}</span>
            <span class="auth-order-estado auth-estado-${p.estado}">${p.estado}</span>
          </div>
          <div class="auth-order-productos">${p.productos}</div>
          <div class="auth-order-total">${p.total}</div>
        </div>
      `).join('');
    })
    .catch(() => { listEl.innerHTML = '<div class="auth-orders-empty">Error al cargar pedidos.</div>'; });
}

function _tradAuthError(code) {
  const map = {
    'auth/invalid-email':        'Email inválido.',
    'auth/user-not-found':       'No existe una cuenta con ese email.',
    'auth/wrong-password':       'Contraseña incorrecta.',
    'auth/invalid-credential':   'Email o contraseña incorrectos.',
    'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
    'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres.',
    'auth/too-many-requests':    'Demasiados intentos. Intentá más tarde.',
    'auth/missing-email':        'Ingresá tu email.',
  };
  return map[code] || 'Ocurrió un error. Intentá de nuevo.';
}

// ── SVG WhatsApp ──────────────────────────────────────────────
const WA_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="white"/></svg>`;

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  actualizarCarritoUI();

  // Actualizar todos los links de WA hardcodeados con el número configurado
  document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
    a.href = a.href.replace(/wa\.me\/\d+/, `wa.me/${WA_NUMBER}`);
  });

  const waFloat = document.querySelector('.wa-float');
  if (waFloat) waFloat.innerHTML = WA_SVG;

  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="co-overlay" id="co-overlay" onclick="cerrarCheckout()"></div>
    <div class="co-modal" id="co-modal">
      <div class="co-header">
        <div class="co-steps" id="co-steps">
          <div class="co-dot active" id="co-dot-1"><span>1</span> Tus datos</div>
          <div class="co-step-line"></div>
          <div class="co-dot" id="co-dot-2"><span>2</span> Pagar</div>
        </div>
        <button class="co-close" onclick="cerrarCheckout()">✕</button>
      </div>

      <div class="co-body" id="co-paso-0" style="display:none;">
        <div class="co-title">¿Querés guardar tu pedido?</div>
        <div class="co-sub">Iniciá sesión para ver tu historial, o continuá como invitado.</div>

        <div id="co-auth-forms">
          <div id="co-auth-login">
            <div class="co-field"><label>Email</label><input type="email" id="co-auth-email" placeholder="tu@email.com"></div>
            <div class="co-field"><label>Contraseña</label><input type="password" id="co-auth-pass" placeholder="••••••••"></div>
            <div class="auth-error" id="co-auth-err" style="margin-bottom:.5rem;"></div>
            <button class="co-btn-primary" onclick="coAuthLogin()">Iniciar sesión →</button>
            <div class="auth-links" style="margin-top:.75rem;">
              <button class="auth-link" onclick="switchCoAuth('registro')">¿No tenés cuenta? Registrate</button>
            </div>
          </div>

          <div id="co-auth-registro" style="display:none;">
            <div class="co-field"><label>Nombre</label><input type="text" id="co-auth-nombre" placeholder="Tu nombre"></div>
            <div class="co-field"><label>Email</label><input type="email" id="co-auth-reg-email" placeholder="tu@email.com"></div>
            <div class="co-field"><label>Contraseña</label><input type="password" id="co-auth-reg-pass" placeholder="Mínimo 6 caracteres"></div>
            <div class="auth-error" id="co-auth-err-reg" style="margin-bottom:.5rem;"></div>
            <button class="co-btn-primary" onclick="coAuthRegistrar()">Crear cuenta →</button>
            <div class="auth-links" style="margin-top:.75rem;">
              <button class="auth-link" onclick="switchCoAuth('login')">← Ya tengo cuenta</button>
            </div>
          </div>
        </div>

        <div class="auth-divider">o</div>
        <button class="co-btn-back" onclick="_coPaso(1)" style="width:100%;text-align:center;">Continuar como invitado →</button>
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

      <div class="co-body" id="co-paso-2-mp" style="display:none;">
        <div class="co-title">Resumen del pedido</div>
        <div class="co-sub">Revisá tu pedido antes de pagar.</div>
        <div id="co-resumen-mp"></div>
        <button class="co-btn-mp" onclick="irAMP()">
          <svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10" fill="#009ee3"/><path d="M7 14c.8-2.2 2.8-3.8 5-3.8s4.2 1.6 5 3.8" stroke="white" stroke-width="1.5" stroke-linecap="round"/><circle cx="9.5" cy="10" r="1" fill="white"/><circle cx="14.5" cy="10" r="1" fill="white"/></svg>
          Pagar con Mercado Pago
        </button>
        <button class="co-btn-back" onclick="coVolver()">← Volver</button>
      </div>

      <div class="co-body" id="co-paso-2-transfer" style="display:none;">
        <div class="co-title">Datos para la transferencia</div>
        <div class="co-sub">Hacé la transferencia y después envianos el comprobante por WhatsApp.</div>
        <div class="co-bank-box" id="co-bank-box"></div>
        <div class="co-bank-total">
          <span class="co-bank-total-label">Total a transferir</span>
          <span class="co-bank-total-amount" id="co-transfer-total">$0</span>
        </div>
        <div id="co-resumen-transfer" style="margin-bottom:1.25rem;font-size:13px;color:var(--gris-texto);"></div>
        <button class="co-btn-wa-transfer" onclick="irTransferWA()">
          <svg viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Ya hice la transferencia → Enviar comprobante
        </button>
        <button class="co-btn-back" onclick="coVolver()">← Volver</button>
      </div>

      <div class="co-body" id="co-paso-3" style="display:none; text-align:center;">
        <div style="font-size:52px;margin-bottom:1rem;">✅</div>
        <div class="co-title" id="co-paso3-title"></div>
        <div class="co-sub" id="co-paso3-sub" style="margin-bottom:1.5rem;"></div>
        <button class="co-btn-mp" id="co-paso3-btn-mp" style="display:none;" onclick="irMP()">
          <svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10" fill="#009ee3"/><path d="M7 14c.8-2.2 2.8-3.8 5-3.8s4.2 1.6 5 3.8" stroke="white" stroke-width="1.5" stroke-linecap="round"/><circle cx="9.5" cy="10" r="1" fill="white"/><circle cx="14.5" cy="10" r="1" fill="white"/></svg>
          Ir a Mercado Pago
        </button>
        <button class="co-btn-back" onclick="cerrarCheckout();limpiarCarrito();">Cerrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // ── Modal de cuenta / auth ────────────────────────────────
  const authEl = document.createElement('div');
  authEl.innerHTML = `
    <div class="auth-overlay" id="auth-overlay" onclick="cerrarAuthModal()"></div>
    <div class="auth-modal" id="auth-modal">
      <button class="auth-close" onclick="cerrarAuthModal()">✕</button>

      <div id="auth-view-login">
        <div class="auth-title">Iniciá sesión</div>
        <div class="auth-sub">Guardá tu historial de compras</div>
        <div class="auth-field"><label>Email</label><input type="email" id="auth-email" placeholder="tu@email.com"></div>
        <div class="auth-field"><label>Contraseña</label><input type="password" id="auth-pass" placeholder="••••••••"></div>
        <div class="auth-error" id="auth-err-login"></div>
        <button class="auth-btn-primary" onclick="authLogin()">Iniciar sesión</button>
        <div class="auth-links">
          <button class="auth-link" onclick="switchAuthView('reset')">¿Olvidaste tu contraseña?</button>
          <button class="auth-link" onclick="switchAuthView('registro')">¿No tenés cuenta? Registrate</button>
        </div>
        <div class="auth-divider">o</div>
        <button class="auth-btn-secondary" onclick="cerrarAuthModal()">Continuar sin cuenta</button>
      </div>

      <div id="auth-view-registro" style="display:none">
        <div class="auth-title">Crear cuenta</div>
        <div class="auth-sub">Registrate para ver tu historial de compras</div>
        <div class="auth-field"><label>Nombre</label><input type="text" id="auth-nombre" placeholder="Tu nombre"></div>
        <div class="auth-field"><label>Email</label><input type="email" id="auth-reg-email" placeholder="tu@email.com"></div>
        <div class="auth-field"><label>Contraseña</label><input type="password" id="auth-reg-pass" placeholder="Mínimo 6 caracteres"></div>
        <div class="auth-error" id="auth-err-registro"></div>
        <button class="auth-btn-primary" onclick="authRegistrar()">Crear cuenta</button>
        <button class="auth-link" onclick="switchAuthView('login')">← Ya tengo cuenta</button>
      </div>

      <div id="auth-view-cuenta" style="display:none">
        <div class="auth-title">Mi cuenta</div>
        <div class="auth-user-info" id="auth-user-info"></div>
        <div class="auth-orders-title">Mis pedidos</div>
        <div class="auth-orders" id="auth-orders-list"><div class="auth-orders-empty">Cargando...</div></div>
        <button class="auth-btn-secondary" style="margin-top:1rem;" onclick="authLogout()">Cerrar sesión</button>
      </div>

      <div id="auth-view-reset" style="display:none">
        <div class="auth-title">Recuperar contraseña</div>
        <div class="auth-sub">Te mandamos un email para restablecer tu contraseña</div>
        <div class="auth-field"><label>Email</label><input type="email" id="auth-reset-email" placeholder="tu@email.com"></div>
        <div class="auth-error" id="auth-err-reset"></div>
        <button class="auth-btn-primary" onclick="authResetPassword()">Enviar email</button>
        <button class="auth-link" onclick="switchAuthView('login')">← Volver</button>
      </div>
    </div>
  `;
  document.body.appendChild(authEl);

  // ── Observer: actualiza nav según estado de sesión ────────
  auth.onAuthStateChanged(user => {
    const btn = document.getElementById('account-nav-btn');
    if (!btn) return;
    if (user) {
      const nombre = user.displayName || user.email.split('@')[0];
      btn.textContent = `👤 ${nombre}`;
    } else {
      btn.textContent = '👤 Mi cuenta';
    }
  });
});
