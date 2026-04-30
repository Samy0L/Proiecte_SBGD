// ============================================================
//  ui.js — shared UI helpers (toast, modal, nav)
// ============================================================

// ---- Modal ----
const Modal = {
  open(id)  { document.getElementById(id).classList.add('open');    },
  close(id) { document.getElementById(id).classList.remove('open'); },
};

// ---- Toast ----
const UI = {
  toast(msg, duration = 3000) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(UI._toastTimer);
    UI._toastTimer = setTimeout(() => { el.style.display = 'none'; }, duration);
  },

  badge(el, count) {
    if (count > 0) { el.textContent = count; el.classList.remove('hidden'); }
    else            { el.classList.add('hidden'); }
  },

  // ---- generic helpers ----
  el(id) { return document.getElementById(id); },

  empty(container, icon = '📭', text = 'Nicio înregistrare.') {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">${icon}</div>
        <p>${text}</p>
      </div>`;
  },
};

// ---- Navigation ----
const Nav = {
  pages: ['dashboard','carti','studenti','imprumuturi','aprobari','istoric','isbn'],

  toggleSidebar() {
    const app = document.getElementById('app');
    if (!app) return;
    app.classList.toggle('sidebar-open');
    app.classList.toggle('sidebar-collapsed');
  },

  closeSidebar() {
    const app = document.getElementById('app');
    if (!app) return;
    app.classList.remove('sidebar-open');
    app.classList.add('sidebar-collapsed');
  },

  showPage(name) {
    const restrictedForStudents = ['istoric', 'isbn'];
    if (Auth && !Auth.isAdmin() && restrictedForStudents.includes(name)) {
      UI.toast('Aceasta pagina este disponibila doar bibliotecarului.');
      name = 'dashboard';
    }

    if (name !== 'isbn' && Pages && typeof Pages.stopScanner === 'function') {
      Pages.stopScanner();
    }

    // hide all pages
    this.pages.forEach(p => {
      const el = document.getElementById('page-' + p);
      if (el) el.classList.remove('active');
    });

    // deactivate all nav items
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    // activate target
    const page = document.getElementById('page-' + name);
    if (page) page.classList.add('active');

    const navBtn = document.getElementById('nav-' + name);
    if (navBtn) navBtn.classList.add('active');

    // render page content
    const renderers = {
      dashboard:    Pages.dashboard,
      carti:        Pages.carti,
      studenti:     Pages.studenti,
      imprumuturi:  Pages.imprumuturi,
      aprobari:     Pages.aprobari,
      istoric:      Pages.istoric,
      isbn:         Pages.isbn,
    };
    if (renderers[name]) renderers[name]();
    this.closeSidebar();
  },
};

// ---- Close modals on Escape ----
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

// ---- Close modal on overlay click ----
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});
