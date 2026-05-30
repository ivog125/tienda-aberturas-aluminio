/* ============================================================
   ABERTURAS — PARTIALS
   Nav, carrito sidebar, footer como strings inyectables
   ============================================================ */

function renderNav(activePage) {
  const pages = [
    { href: 'index.html',         label: 'Inicio' },
    { href: 'ventanas.html',      label: 'Ventanas' },
    { href: 'puertas.html',       label: 'Puertas y Portones' },
    { href: 'revestimientos.html',label: 'Revestimientos' },
    { href: 'contacto.html',      label: 'Contacto' },
  ];
  const links = pages.map(p =>
    `<li><a href="${p.href}" class="${activePage === p.href ? 'active' : ''}">${p.label}</a></li>`
  ).join('');

  return `
  <div class="topbar">
    <div class="topbar-left">
      <span>📍 Buenos Aires, Argentina</span>
      <span>·</span>
      <a href="tel:01100000000" class="topbar-link">📞 (011) 0000-0000</a>
      <span>·</span>
      <span>Lun–Vie 8–18hs · Sáb 8–13hs</span>
    </div>
    <div class="topbar-right">
      <a href="contacto.html" class="topbar-link">Contacto</a>
    </div>
  </div>
  <nav>
    <a class="nav-logo" href="index.html">
      <img src="logo.jpg" alt="Omar Aberturas" style="height:52px; width:52px; object-fit:cover; border-radius:8px;">
      <div>
        <div class="nav-logo-text">Omar <span>Aberturas</span></div>
        <div class="nav-logo-sub">Fábrica &amp; Distribución</div>
      </div>
    </a>
    <ul class="nav-links">${links}</ul>
    <div class="nav-right">
      <button class="cart-nav-btn" onclick="toggleCart()">
        🛒 Carrito
        <span class="cart-badge hidden" id="cart-badge">0</span>
      </button>
      <a href="contacto.html" class="btn-contacto">✉ Contacto</a>
    </div>
  </nav>`;
}

function renderCartSidebar() {
  return `
  <div class="cart-overlay" id="cart-overlay" onclick="toggleCart()"></div>
  <div class="cart-sidebar" id="cart-sidebar">
    <div class="cart-header">
      <span class="cart-title">🛒 Tu carrito</span>
      <button class="cart-close" onclick="toggleCart()">✕</button>
    </div>
    <div class="cart-items" id="cart-items">
      <div class="cart-empty" id="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Tu carrito está vacío</p>
      </div>
    </div>
    <div class="cart-footer" id="cart-footer" style="display:none;">
      <div class="cart-resumen" id="cart-resumen"></div>
      <div class="cart-actions">
        <button class="btn-mp" onclick="pagarMP()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10" fill="#009ee3"/><path d="M7 14c.8-2.2 2.8-3.8 5-3.8s4.2 1.6 5 3.8" stroke="white" stroke-width="1.5" stroke-linecap="round"/><circle cx="9.5" cy="10" r="1" fill="white"/><circle cx="14.5" cy="10" r="1" fill="white"/></svg>
          Pagar con Mercado Pago
        </button>
        <button class="btn-wa-cart" onclick="enviarWA()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Consultar por WhatsApp
        </button>
      </div>
      <button class="cart-limpiar" onclick="limpiarCarrito()">Vaciar carrito</button>
    </div>
  </div>
  <div class="toast" id="toast"></div>
  <a href="https://wa.me/${WA_NUMBER}" class="wa-float" title="WhatsApp"></a>`;
}

function renderFooter() {
  return `
  <footer>
    <div class="footer-inner">
      <div>
        <div class="footer-logo">Omar <span>Aberturas</span></div>
        <p class="footer-tagline">Fábrica y distribución de aberturas. Más de 15 años de experiencia en el rubro.</p>
        <div class="footer-social">
          <a href="#">f</a><a href="#">📷</a><a href="#">💬</a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Productos</div>
        <ul class="footer-links">
          <li><a href="ventanas.html">Ventanas de aluminio</a></li>
          <li><a href="puertas.html">Puertas de chapa</a></li>
          <li><a href="puertas.html">Portones</a></li>
          <li><a href="puertas.html">Puertas de madera</a></li>
          <li><a href="revestimientos.html">Revestimientos PVC</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-col-title">Información</div>
        <ul class="footer-links">
          <li><a href="index.html">Inicio</a></li>
          <li><a href="contacto.html">Contacto</a></li>
          <li><a href="contacto.html">Cómo comprar</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-col-title">¿Necesitás ayuda?</div>
        <div style="background:rgba(255,255,255,.05);border-radius:10px;padding:1rem;">
          <div style="font-size:13px;color:rgba(255,255,255,.6);margin-bottom:6px;">Escribinos por WhatsApp</div>
          <a href="https://wa.me/${WA_NUMBER}" style="display:flex;align-items:center;gap:8px;background:#25D366;color:white;padding:10px 14px;border-radius:8px;text-decoration:none;font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chatear ahora
          </a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2025 Aberturas — Fábrica y distribución · Buenos Aires</span>
      <span>Todos los derechos reservados</span>
    </div>
  </footer>`;
}
