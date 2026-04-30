// ============================================================
//  pages.js — render logic for each page
// ============================================================

const Pages = {
  scanner: null,
  scannerRunning: false,
  scannedBookId: null,

  normalizeISBN(value) {
    return String(value || '').replace(/[^0-9Xx]/g, '').toUpperCase();
  },

  findBookByISBN(isbnValue) {
    const normalized = this.normalizeISBN(isbnValue);
    if (!normalized) return null;
    return DB.carti.find(c => this.normalizeISBN(c.isbn) === normalized);
  },

  // ======================================================
  //  DASHBOARD
  // ======================================================
  dashboard() {
    const today   = new Date().toISOString().split('T')[0];
    const active  = DB.imprumuturi.filter(i => i.status === 'activ');
    const overdue = active.filter(i => i.termen < today);
    const approvedStudents = DB.users.filter(u => u.role === 'student' && u.status === 'activ');

    UI.el('statTotalCarti').textContent   = DB.carti.length;
    UI.el('statTotalStudenti').textContent = approvedStudents.length;
    UI.el('statImprumuturi').textContent  = active.length;
    UI.el('statIntarzieri').textContent   = overdue.length;

    // pending badge in sidebar
    const pending = DB.users.filter(u => u.status === 'pending').length
                  + DB.extinderi.filter(e => e.status === 'pending').length;
    UI.badge(UI.el('pendingBadge'), pending);

    // Recent activity
    const actEl = UI.el('recentActivity');
    const logs  = [...DB.logs].reverse().slice(0, 6);
    if (!logs.length) { UI.empty(actEl); return; }
    actEl.innerHTML = logs.map(l => `
      <div class="activity-item">
        <span class="activity-icon">${tipIcon(l.tip)}</span>
        <div>
          <div class="activity-text">${l.desc}</div>
          <div class="activity-time">${l.data}</div>
        </div>
      </div>`).join('');

    // Recent books
    const booksEl = UI.el('recentBooks');
    booksEl.innerHTML = [...DB.carti].reverse().slice(0, 5).map(c => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-light);">
        <span style="font-size:22px;">📖</span>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.titlu}</div>
          <div style="font-size:11px;color:var(--text-muted);">${c.autor} · ${c.an}</div>
        </div>
        <span class="badge ${c.disponibile > 0 ? 'badge-green' : 'badge-yellow'}">${c.disponibile > 0 ? 'Disponib.' : 'Împrum.'}</span>
      </div>`).join('');
  },

  // ======================================================
  //  CARTI
  // ======================================================
  carti(filtered) {
    const list  = filtered || DB.carti;
    const grid  = UI.el('cartiGrid');
    const admin = Auth.isAdmin();
    const currentUser = Auth.getCurrent();

    if (!list.length) { UI.empty(grid, '📚', 'Nicio carte găsită.'); return; }

    grid.innerHTML = list.map(c => `
      <div class="book-card">
        <div class="book-card-stripe"></div>
        <div class="book-card-body">
          <div class="book-card-top">
            <span class="badge ${c.disponibile > 0 ? 'badge-green' : 'badge-yellow'}">${c.disponibile > 0 ? c.disponibile + ' disp.' : 'Împrumutat'}</span>
            <span style="font-size:11px;color:var(--text-muted);">${c.gen}</span>
          </div>
          <div class="book-title">${c.titlu}</div>
          <div class="book-author">${c.autor}</div>
          ${admin ? `
            <div class="book-meta">
              <div>📕 ${c.editura} &middot; ${c.an}</div>
              <div class="isbn">ISBN: ${c.isbn}</div>
              <div>📄 ${c.pagini} pag. &middot; ${c.coperta} &middot; ${c.limba}</div>
            </div>
          ` : `
            <div class="book-meta">
              <div>📕 Editie biblioteca</div>
              <div>📄 Detalii complete vizibile doar bibliotecarului</div>
            </div>
          `}
        </div>
        ${admin ? `
        <div class="book-actions">
          <button class="btn btn-ghost btn-sm" onclick="Pages.editBook('${c.id}')">✏️ Editare</button>
          <button class="btn btn-danger btn-sm" onclick="Pages.deleteBook('${c.id}')">🗑️ Șterge</button>
        </div>` : `
        <div class="book-actions">
          <button class="btn btn-gold btn-sm" onclick="Pages.imprumutaCarte('${c.id}')" ${(!currentUser || c.disponibile <= 0) ? 'disabled' : ''}>
            ${c.disponibile > 0 ? '📚 Împrumută' : 'Indisponibilă'}
          </button>
        </div>`}
      </div>`).join('');
  },

  async imprumutaCarte(carteId) {
    const user = Auth.getCurrent();
    if (!user || user.role !== 'student') {
      UI.toast('Doar studentii pot imprumuta din catalog.');
      return;
    }

    const carte = DB.findCarte(carteId);
    if (!carte) {
      UI.toast('Cartea nu a fost gasita.');
      return;
    }
    if (carte.disponibile <= 0) {
      UI.toast('Aceasta carte nu este disponibila momentan.');
      return;
    }

    const areDeja = DB.imprumuturi.some(i => i.studentId === user.id && i.carteId === carteId && i.status === 'activ');
    if (areDeja) {
      UI.toast('Ai deja un imprumut activ pentru aceasta carte.');
      return;
    }

    const termen = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    DB.imprumuturi.push({
      id: 'i' + DB.nextId(),
      carteId,
      studentId: user.id,
      dataImprumut: new Date().toISOString().split('T')[0],
      termen,
      status: 'activ',
    });

    carte.disponibile--;
    DB.addLog('imprumut', `Împrumut student: "${carte.titlu}" → ${user.name}`, user.id);
    await DB.saveState();
    UI.toast(`Ai imprumutat: ${carte.titlu}`);
    this.carti();
  },

  filterCarti() {
    const q      = UI.el('searchCarti').value.toLowerCase();
    const gen    = UI.el('filterGen').value;
    const status = UI.el('filterStatus').value;
    let list = DB.carti;
    if (q)      list = list.filter(c => c.titlu.toLowerCase().includes(q) || c.autor.toLowerCase().includes(q) || c.isbn.includes(q));
    if (gen)    list = list.filter(c => c.gen === gen);
    if (status === 'disponibila') list = list.filter(c => c.disponibile > 0);
    else if (status === 'imprumutata') list = list.filter(c => c.disponibile === 0);
    this.carti(list);
  },

  showAddBookModal() {
    UI.el('bookModalTitle').textContent = 'Adaugă Carte';
    UI.el('bookEditId').value = '';
    ['bookTitlu','bookAutor','bookEditura','bookISBN','bookAn','bookPagini'].forEach(id => UI.el(id).value = '');
    UI.el('bookExemplare').value = 1;
    Modal.open('bookModal');
  },

  editBook(id) {
    const c = DB.findCarte(id);
    if (!c) return;
    UI.el('bookModalTitle').textContent = 'Editează Carte';
    UI.el('bookEditId').value    = id;
    UI.el('bookTitlu').value     = c.titlu;
    UI.el('bookAutor').value     = c.autor;
    UI.el('bookEditura').value   = c.editura;
    UI.el('bookISBN').value      = c.isbn;
    UI.el('bookAn').value        = c.an;
    UI.el('bookPagini').value    = c.pagini;
    UI.el('bookGen').value       = c.gen;
    UI.el('bookCoperta').value   = c.coperta;
    UI.el('bookLimba').value     = c.limba;
    UI.el('bookExemplare').value = c.exemplare;
    Modal.open('bookModal');
  },

  async saveBook() {
    const editId = UI.el('bookEditId').value;
    const data = {
      titlu:     UI.el('bookTitlu').value.trim(),
      autor:     UI.el('bookAutor').value.trim(),
      editura:   UI.el('bookEditura').value.trim(),
      isbn:      UI.el('bookISBN').value.trim(),
      an:        parseInt(UI.el('bookAn').value)       || new Date().getFullYear(),
      pagini:    parseInt(UI.el('bookPagini').value)   || 0,
      gen:       UI.el('bookGen').value,
      coperta:   UI.el('bookCoperta').value,
      limba:     UI.el('bookLimba').value,
      exemplare: parseInt(UI.el('bookExemplare').value) || 1,
    };

    if (!data.titlu || !data.autor) { alert('Titlul și autorul sunt obligatorii.'); return; }

    const user = Auth.getCurrent();

    if (editId) {
      const idx = DB.carti.findIndex(c => c.id === editId);
      data.disponibile = DB.carti[idx].disponibile;
      DB.carti[idx] = { ...DB.carti[idx], ...data };
      DB.addLog('adaugare', `Carte actualizată: "${data.titlu}"`, user.id);
      UI.toast('Cartea a fost actualizată!');
    } else {
      DB.carti.push({ id: 'c' + DB.nextId(), disponibile: data.exemplare, ...data });
      DB.addLog('adaugare', `Carte adăugată: "${data.titlu}"`, user.id);
      UI.toast('Carte adăugată cu succes!');
    }
    await DB.saveState();

    Modal.close('bookModal');
    this.carti();
  },

  async deleteBook(id) {
    const c = DB.findCarte(id);
    if (!c || !confirm(`Ștergi "${c.titlu}"?`)) return;
    DB.carti = DB.carti.filter(x => x.id !== id);
    DB.addLog('adaugare', `Carte ștearsă: "${c.titlu}"`, Auth.getCurrent().id);
    await DB.saveState();
    UI.toast('Carte ștearsă.');
    this.carti();
  },

  // ======================================================
  //  STUDENTI
  // ======================================================
  studenti() {
    const tbody = UI.el('studentiTable');
    const students = DB.users.filter(u => u.role === 'student');

    if (!students.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">Niciun student înregistrat.</td></tr>'; return; }

    tbody.innerHTML = students.map(s => {
      const loans = DB.imprumuturi.filter(i => i.studentId === s.id).length;
      const badgeCls = s.status === 'activ' ? 'badge-green' : s.status === 'pending' ? 'badge-blue' : 'badge-gray';
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="user-avatar" style="flex-shrink:0;">${s.name[0]}</div>
              <div>
                <div class="td-title">${s.name}</div>
                <div class="td-sub">${s.id} &middot; ${s.facultate || '—'}</div>
              </div>
            </div>
          </td>
          <td>${s.email}</td>
          <td>${s.dataInreg || '—'}</td>
          <td><span class="badge ${badgeCls}">${s.status}</span></td>
          <td style="font-weight:600;">${loans}</td>
          <td>
            <div class="td-actions">
              ${s.status === 'pending'
                ? `<button class="btn btn-gold btn-sm" onclick="Pages.approveStudent('${s.id}')">✓ Aprobă</button>`
                : s.status === 'activ'
                  ? `<button class="btn btn-ghost btn-sm" onclick="Pages.deactivateStudent('${s.id}')">Dezactivează</button>`
                  : '—'}
            </div>
          </td>
        </tr>`;
    }).join('');
  },

  async approveStudent(id) {
    const u = DB.findUser(id);
    if (!u) return;
    u.status = 'activ';
    DB.addLog('aprobare', `Student aprobat: ${u.name}`, Auth.getCurrent().id);
    await DB.saveState();
    UI.toast('Student aprobat cu succes!');
    this.studenti();
    this.aprobari();
  },

  async deactivateStudent(id) {
    const u = DB.findUser(id);
    if (!u || !confirm(`Dezactivezi contul lui ${u.name}?`)) return;
    u.status = 'inactiv';
    await DB.saveState();
    UI.toast('Cont dezactivat.');
    this.studenti();
  },

  async rejectStudent(id) {
    const u = DB.findUser(id);
    if (!u || !confirm(`Respingi cererea lui ${u.name}?`)) return;
    DB.users = DB.users.filter(x => x.id !== id);
    DB.addLog('aprobare', `Cerere respinsă: ${u.name}`, Auth.getCurrent().id);
    await DB.saveState();
    UI.toast('Cerere respinsă.');
    this.aprobari();
    this.studenti();
  },

  // ======================================================
  //  IMPRUMUTURI
  // ======================================================
  imprumuturi() {
    const tbody = UI.el('imprumututriTable');
    const today = new Date().toISOString().split('T')[0];
    const user  = Auth.getCurrent();

    let list = DB.imprumuturi;
    if (!Auth.isAdmin()) list = list.filter(i => i.studentId === user.id);

    if (!list.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">Niciun împrumut.</td></tr>'; return; }

    tbody.innerHTML = list.map(i => {
      const carte   = DB.findCarte(i.carteId);
      const student = DB.findUser(i.studentId);
      const overdue = i.status === 'activ' && i.termen < today;
      const badgeCls = i.status === 'restituit' ? 'badge-green' : overdue ? 'badge-red' : 'badge-yellow';
      const label    = i.status === 'restituit' ? 'Restituit' : overdue ? 'Întârziat' : 'Activ';
      return `
        <tr>
          <td>
            <div class="td-title">${carte?.titlu || 'N/A'}</div>
            <div class="td-sub">${carte?.isbn || ''}</div>
          </td>
          <td>${student?.name || 'N/A'}</td>
          <td>${i.dataImprumut}</td>
          <td style="${overdue ? 'color:#c0392b;font-weight:700;' : ''}">${i.termen}</td>
          <td><span class="badge ${badgeCls}">${label}</span></td>
          <td>
            <div class="td-actions">
              ${i.status === 'activ'
                ? `<button class="btn btn-gold btn-sm admin-only" onclick="Pages.restituie('${i.id}')">↩ Restituire</button>
                   ${!Auth.isAdmin() ? `<button class="btn btn-ghost btn-sm" onclick="Pages.cerereExtindere('${i.id}')">⏱ Extindere</button>` : ''}`
                : '—'}
            </div>
          </td>
        </tr>`;
    }).join('');

    // re-apply role UI after render
    Auth.applyRoleUI();
  },

  showImprumutModal() {
    const carteSelect   = UI.el('imprumutCarte');
    const studentSelect = UI.el('imprumutStudent');

    carteSelect.innerHTML = DB.carti
      .filter(c => c.disponibile > 0)
      .map(c => `<option value="${c.id}">${c.titlu} (disp: ${c.disponibile})</option>`)
      .join('');

    studentSelect.innerHTML = DB.users
      .filter(u => u.role === 'student' && u.status === 'activ')
      .map(u => `<option value="${u.id}">${u.name}</option>`)
      .join('');

    const d = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    UI.el('imprumutTermen').value = d;
    Modal.open('imprumutModal');
  },

  async saveImprumut() {
    const carteId   = UI.el('imprumutCarte').value;
    const studentId = UI.el('imprumutStudent').value;
    const termen    = UI.el('imprumutTermen').value;

    if (!carteId || !studentId || !termen) { alert('Completați toate câmpurile.'); return; }

    const carte   = DB.findCarte(carteId);
    const student = DB.findUser(studentId);

    DB.imprumuturi.push({
      id: 'i' + DB.nextId(), carteId, studentId,
      dataImprumut: new Date().toISOString().split('T')[0],
      termen, status: 'activ'
    });

    carte.disponibile--;
    DB.addLog('imprumut', `Împrumut: "${carte.titlu}" → ${student.name}`, Auth.getCurrent().id);
    await DB.saveState();
    Modal.close('imprumutModal');
    UI.toast('Împrumut înregistrat!');
    this.imprumuturi();
  },

  async restituie(id) {
    const imp   = DB.findImprumut(id);
    if (!imp)   return;
    imp.status = 'restituit';
    const carte   = DB.findCarte(imp.carteId);
    const student = DB.findUser(imp.studentId);
    if (carte) carte.disponibile++;
    DB.addLog('restituire', `Restituire: "${carte?.titlu}" ← ${student?.name}`, Auth.getCurrent().id);
    await DB.saveState();
    UI.toast('Cartea a fost restituită!');
    this.imprumuturi();
  },

  async cerereExtindere(imprumutId) {
    const motiv = prompt('Motivul solicitării de extindere:');
    if (!motiv) return;
    const imp = DB.findImprumut(imprumutId);
    DB.extinderi.push({
      id: 'e' + DB.nextId(),
      studentId: Auth.getCurrent().id,
      carteId: imp.carteId,
      imprumutId,
      motiv, status: 'pending',
      data: new Date().toISOString().split('T')[0]
    });
    DB.addLog('aprobare', `Cerere extindere de la ${Auth.getCurrent().name}`, Auth.getCurrent().id);
    await DB.saveState();
    UI.toast('Cerere de extindere trimisă!');
  },

  // ======================================================
  //  APROBARI
  // ======================================================
  aprobari() {
    // pending students
    const pendingStudents = DB.users.filter(u => u.status === 'pending');
    const psEl = UI.el('pendingStudents');
    if (!pendingStudents.length) {
      psEl.innerHTML = '<p class="text-muted text-small" style="padding:16px 0;">Nicio cerere de înregistrare.</p>';
    } else {
      psEl.innerHTML = pendingStudents.map(s => `
        <div class="approval-card">
          <div class="approval-top">
            <div class="approval-info">
              <div class="name">${s.name}</div>
              <div class="meta">${s.email}<br>${s.facultate || 'N/A'} &middot; ${s.dataInreg || ''}</div>
            </div>
            <div class="approval-actions">
              <button class="btn btn-gold btn-sm" onclick="Pages.approveStudent('${s.id}')">✓</button>
              <button class="btn btn-danger btn-sm" onclick="Pages.rejectStudent('${s.id}')">✗</button>
            </div>
          </div>
        </div>`).join('');
    }

    // pending extinderi
    const pending = DB.extinderi.filter(e => e.status === 'pending');
    const erEl = UI.el('extendRequests');
    if (!pending.length) {
      erEl.innerHTML = '<p class="text-muted text-small" style="padding:16px 0;">Nicio solicitare de extindere.</p>';
    } else {
      erEl.innerHTML = pending.map(e => {
        const carte   = DB.findCarte(e.carteId);
        const student = DB.findUser(e.studentId);
        return `
          <div class="approval-card">
            <div class="approval-top">
              <div class="approval-info">
                <div class="name">${carte?.titlu || 'N/A'}</div>
                <div class="meta">Student: ${student?.name || 'N/A'}<br>Motiv: ${e.motiv}</div>
              </div>
              <div class="approval-actions">
                <button class="btn btn-gold btn-sm" onclick="Pages.approveExtindere('${e.id}')">✓</button>
                <button class="btn btn-danger btn-sm" onclick="Pages.rejectExtindere('${e.id}')">✗</button>
              </div>
            </div>
          </div>`;
      }).join('');
    }

    // refresh pending badge
    const pending2 = pendingStudents.length + pending.length;
    UI.badge(UI.el('pendingBadge'), pending2);
  },

  async approveExtindere(id) {
    const e = DB.extinderi.find(x => x.id === id);
    if (!e) return;
    e.status = 'aprobat';
    const imp = DB.findImprumut(e.imprumutId);
    if (imp) {
      const d = new Date(imp.termen);
      d.setDate(d.getDate() + 14);
      imp.termen = d.toISOString().split('T')[0];
    }
    const student = DB.findUser(e.studentId);
    DB.addLog('aprobare', `Extindere aprobată pentru ${student?.name}`, Auth.getCurrent().id);
    await DB.saveState();
    UI.toast('Extindere aprobată! +14 zile.');
    this.aprobari();
  },

  async rejectExtindere(id) {
    const e = DB.extinderi.find(x => x.id === id);
    if (!e) return;
    e.status = 'respins';
    await DB.saveState();
    UI.toast('Extindere respinsă.');
    this.aprobari();
  },

  // ======================================================
  //  ISTORIC
  // ======================================================
  istoric(data) {
    const list = data || [...DB.logs].reverse();
    UI.el('totalLogs').textContent = `${list.length} înregistrări`;
    const tbody = UI.el('istoricTable');

    if (!list.length) { UI.empty(tbody, '📋', 'Niciun jurnal.'); return; }

    const tipBadge = { imprumut: 'badge-yellow', restituire: 'badge-green', aprobare: 'badge-blue', adaugare: 'badge-green' };

    tbody.innerHTML = list.map(l => `
      <tr>
        <td style="white-space:nowrap;color:var(--text-muted);">${l.data}</td>
        <td><span class="badge ${tipBadge[l.tip] || 'badge-gray'}">${l.tip}</span></td>
        <td>${l.desc}</td>
        <td style="color:var(--text-muted);">${l.user}</td>
      </tr>`).join('');
  },

  filterIstoric() {
    const q   = UI.el('searchIstoric').value.toLowerCase();
    const tip = UI.el('filterTipIstoric').value;
    let list  = [...DB.logs].reverse();
    if (q)   list = list.filter(l => l.desc.toLowerCase().includes(q) || l.user.toLowerCase().includes(q));
    if (tip) list = list.filter(l => l.tip === tip);
    this.istoric(list);
  },

  // ======================================================
  //  ISBN / BARCODE
  // ======================================================
  isbn() {
    const listEl = UI.el('isbnList');
    listEl.innerHTML = DB.carti.map(c => `
      <div class="isbn-list-item" onclick="Pages.loadISBN('${c.isbn}', '${c.titlu.replace(/'/g, "\\'")}')">
        <span class="isbn-code">${c.isbn}</span>
        <span class="isbn-book-name">${c.titlu}</span>
      </div>`).join('');

    this.scannedBookId = null;
    const openBtn = UI.el('openScannedBookBtn');
    if (openBtn) openBtn.classList.add('hidden');
    const status = UI.el('scanStatus');
    if (status) status.textContent = 'Scaneaza codul ISBN de pe carte pentru cautare rapida in catalog.';
  },

  loadISBN(isbn, title) {
    UI.el('isbnInput').value  = isbn;
    UI.el('isbnTitle').value  = title;
  },

  generateBarcode() {
    const raw   = UI.el('isbnInput').value.trim().replace(/-/g, '');
    const title = UI.el('isbnTitle').value.trim();
    const prev  = UI.el('barcodePreview');

    if (!raw) { alert('Introduceți un ISBN.'); return; }

    prev.innerHTML = `
      <div class="barcode-result">
        <p style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">${title || 'Cod de Bare ISBN'}</p>
        <svg id="barcodeCanvas"></svg>
        <div class="barcode-isbn">ISBN ${raw}</div>
        <button class="btn btn-gold btn-sm" style="margin-top:12px;" onclick="Pages.printBarcode()">🖨️ Printează</button>
      </div>`;

    try {
      JsBarcode('#barcodeCanvas', raw, {
        format: 'EAN13', width: 2, height: 80,
        displayValue: true, fontSize: 13, margin: 8,
      });
    } catch (err) {
      prev.innerHTML += `<p style="color:#c0392b;font-size:12px;margin-top:8px;">ISBN invalid pentru EAN-13. (${err.message})</p>`;
    }
  },

  generateQR() {
    const isbn  = UI.el('isbnInput').value.trim();
    const title = UI.el('isbnTitle').value.trim();
    const prev  = UI.el('barcodePreview');

    if (!isbn) { alert('Introduceți un ISBN.'); return; }

    prev.innerHTML = `
      <div class="barcode-result">
        <p style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">${title || 'QR Code ISBN'}</p>
        <div id="qrContainer" style="display:flex;justify-content:center;"></div>
        <div class="barcode-isbn" style="margin-top:8px;">${isbn}</div>
      </div>`;

    new QRCode(document.getElementById('qrContainer'), {
      text: `ISBN ${isbn}`,
      width: 180, height: 180,
      colorDark: '#1a1410', colorLight: '#faf7f2',
    });
  },

  printBarcode() {
    const content = UI.el('barcodePreview').innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Cod de Bare</title>
      <style>body{text-align:center;padding:40px;font-family:serif;}</style></head>
      <body>${content}</body></html>`);
    w.document.close();
    w.print();
  },

  async startScanner() {
    if (this.scannerRunning) return;
    if (typeof Html5Qrcode === 'undefined') {
      UI.toast('Scannerul nu este disponibil momentan.');
      return;
    }

    const readerEl = UI.el('scannerReader');
    const statusEl = UI.el('scanStatus');
    const startBtn = UI.el('scanStartBtn');
    const stopBtn = UI.el('scanStopBtn');
    const openBtn = UI.el('openScannedBookBtn');

    readerEl.classList.remove('hidden');
    if (openBtn) openBtn.classList.add('hidden');
    if (statusEl) statusEl.textContent = 'Se porneste camera...';

    try {
      if (!this.scanner) this.scanner = new Html5Qrcode('scannerReader');
      await this.scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 130 }, aspectRatio: 1.7778 },
        decodedText => this.onScanSuccess(decodedText)
      );
      this.scannerRunning = true;
      if (startBtn) startBtn.disabled = true;
      if (stopBtn) stopBtn.disabled = false;
      if (statusEl) statusEl.textContent = 'Scanner activ. Pozitioneaza codul in chenar.';
    } catch (err) {
      readerEl.classList.add('hidden');
      if (statusEl) statusEl.textContent = 'Nu s-a putut porni camera. Verifica permisiunea browserului.';
      UI.toast('Eroare la pornirea scannerului.');
    }
  },

  async stopScanner() {
    if (!this.scanner) return;

    const readerEl = UI.el('scannerReader');
    const statusEl = UI.el('scanStatus');
    const startBtn = UI.el('scanStartBtn');
    const stopBtn = UI.el('scanStopBtn');

    try {
      if (this.scannerRunning) await this.scanner.stop();
      await this.scanner.clear();
    } catch (err) {
      // ignore cleanup errors from camera shutdown race conditions
    }

    this.scannerRunning = false;
    readerEl.classList.add('hidden');
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    if (statusEl && !this.scannedBookId) {
      statusEl.textContent = 'Scanner oprit. Apasa "Porneste Scanner" pentru o noua cautare.';
    }
  },

  onScanSuccess(rawText) {
    const code = String(rawText || '').trim();
    if (!code) return;

    const foundBook = this.findBookByISBN(code);
    const statusEl = UI.el('scanStatus');
    const openBtn = UI.el('openScannedBookBtn');

    UI.el('isbnInput').value = code;
    if (foundBook) UI.el('isbnTitle').value = foundBook.titlu;

    if (foundBook) {
      this.scannedBookId = foundBook.id;
      if (statusEl) statusEl.textContent = `Gasit in catalog: "${foundBook.titlu}" (${foundBook.isbn}).`;
      if (openBtn) openBtn.classList.remove('hidden');
      UI.toast(`Carte gasita: ${foundBook.titlu}`);
    } else {
      this.scannedBookId = null;
      if (statusEl) statusEl.textContent = `Cod detectat (${code}), dar nu exista in catalog.`;
      if (openBtn) openBtn.classList.add('hidden');
      UI.toast('Cod detectat, dar cartea nu este in catalog.');
    }

    this.stopScanner();
  },

  openScannedBookInCatalog() {
    if (!this.scannedBookId) {
      UI.toast('Nu exista o carte scanata pentru deschidere.');
      return;
    }

    const foundBook = DB.findCarte(this.scannedBookId);
    if (!foundBook) {
      UI.toast('Cartea scanata nu mai exista in catalog.');
      return;
    }

    Nav.showPage('carti');
    const searchInput = UI.el('searchCarti');
    if (searchInput) searchInput.value = foundBook.isbn;
    this.filterCarti();
    UI.toast(`Catalog filtrat pentru: ${foundBook.titlu}`);
  },

};

// ---- helper ----
function tipIcon(tip) {
  return { imprumut: '🔄', restituire: '✅', aprobare: '👤', adaugare: '📚' }[tip] || '📋';
}
