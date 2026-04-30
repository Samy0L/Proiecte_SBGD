/* pages.js — BibliotecaApp
   Funcții de randare pentru fiecare pagină
*/

/* ════════════════════════════════════════
   DASHBOARD
   ════════════════════════════════════════ */
function renderDashboard() {
  const today   = new Date().toISOString().split('T')[0];
  const active  = db.imprumuturi.filter(i => i.status === 'activ');
  const overdue = active.filter(i => i.termen < today);

  document.getElementById('statTotalCarti').textContent    = db.carti.length;
  document.getElementById('statTotalStudenti').textContent =
    db.users.filter(u => u.role === 'student' && u.status === 'activ').length;
  document.getElementById('statImprumuturi').textContent   = active.length;
  document.getElementById('statIntarzieri').textContent    = overdue.length;

  // Pending badge (sidebar)
  const pendingCount =
    db.users.filter(u => u.status === 'pending').length +
    db.extinderi.filter(e => e.status === 'pending').length;
  const pb = document.getElementById('pendingBadge');
  if (pendingCount > 0) { pb.textContent = pendingCount; pb.classList.remove('hidden'); }
  else { pb.classList.add('hidden'); }

  // Recent activity
  const recentLogs = [...db.logs].reverse().slice(0, 5);
  const iconMap = { imprumut:'🔄', restituire:'✅', aprobare:'👤', adaugare:'📚' };
  document.getElementById('recentActivity').innerHTML = recentLogs.map(l => `
    <div class="activity-item">
      <span class="activity-icon">${iconMap[l.tip] || '📌'}</span>
      <div>
        <div class="activity-title">${l.desc}</div>
        <div class="activity-time">${l.data}</div>
      </div>
    </div>
  `).join('') || '<p style="color:var(--text-light);font-size:.875rem;">Nicio activitate recentă.</p>';

  // Recent books
  document.getElementById('recentBooks').innerHTML = [...db.carti].reverse().slice(0, 4).map(c => `
    <div class="recent-book-item">
      <span class="recent-book-icon">📖</span>
      <div class="recent-book-info">
        <div class="recent-book-title">${c.titlu}</div>
        <div class="recent-book-sub">${c.autor} · ${c.an}</div>
      </div>
      <span class="badge ${c.disponibile > 0 ? 'badge--available' : 'badge--borrowed'}">
        ${c.disponibile > 0 ? 'Disponibilă' : 'Împrumutată'}
      </span>
    </div>
  `).join('');
}

/* ════════════════════════════════════════
   CĂRȚI
   ════════════════════════════════════════ */
function renderCarti(list) {
  list = list || db.carti;
  const isAdmin = currentUser && currentUser.role === 'bibliotecar';
  const grid = document.getElementById('cartiGrid');

  if (!list.length) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:3rem;">Nicio carte găsită.</p>';
    return;
  }

  grid.innerHTML = list.map(c => `
    <div class="book-card">
      <div class="book-card-accent"></div>
      <div class="book-card-body">
        <div class="book-card-meta">
          <span class="badge ${c.disponibile > 0 ? 'badge--available' : 'badge--borrowed'}">
            ${c.disponibile > 0 ? c.disponibile + ' disp.' : 'Împrumutat'}
          </span>
          <span style="font-size:.75rem;color:var(--text-light);">${c.gen}</span>
        </div>
        <div class="book-title">${c.titlu}</div>
        <div class="book-author">${c.autor}</div>
        <div class="book-details">
          <div>📕 ${c.editura} · ${c.an}</div>
          <div class="book-isbn">ISBN: ${c.isbn}</div>
          <div>📄 ${c.pagini} pag. · ${c.coperta} · ${c.limba}</div>
        </div>
      </div>
      ${isAdmin ? `
      <div class="book-actions">
        <button class="btn btn-outline btn-xs" onclick="showEditBookModal('${c.id}')">✏️ Editare</button>
        <button class="btn btn-danger btn-xs" onclick="deleteBook('${c.id}')">🗑️ Șterge</button>
      </div>` : ''}
    </div>
  `).join('');
}

function filterCarti() {
  const q      = document.getElementById('searchCarti').value.toLowerCase();
  const gen    = document.getElementById('filterGen').value;
  const status = document.getElementById('filterStatus').value;

  let list = db.carti;
  if (q)      list = list.filter(c =>
    c.titlu.toLowerCase().includes(q) ||
    c.autor.toLowerCase().includes(q) ||
    c.isbn.includes(q)
  );
  if (gen)    list = list.filter(c => c.gen === gen);
  if (status === 'disponibila')  list = list.filter(c => c.disponibile > 0);
  if (status === 'imprumutata')  list = list.filter(c => c.disponibile === 0);

  renderCarti(list);
}

/* ── Book modal helpers ── */
function showAddBookModal() {
  document.getElementById('bookModalTitle').textContent = 'Adaugă Carte';
  document.getElementById('bookEditId').value = '';
  ['bookTitlu','bookAutor','bookEditura','bookISBN','bookAn','bookPagini'].forEach(id =>
    document.getElementById(id).value = ''
  );
  document.getElementById('bookExemplare').value = 1;
  document.getElementById('bookModal').classList.remove('hidden');
}

function showEditBookModal(id) {
  const c = db.carti.find(x => x.id === id);
  if (!c) return;
  document.getElementById('bookModalTitle').textContent = 'Editează Carte';
  document.getElementById('bookEditId').value    = id;
  document.getElementById('bookTitlu').value     = c.titlu;
  document.getElementById('bookAutor').value     = c.autor;
  document.getElementById('bookEditura').value   = c.editura;
  document.getElementById('bookISBN').value      = c.isbn;
  document.getElementById('bookAn').value        = c.an;
  document.getElementById('bookPagini').value    = c.pagini;
  document.getElementById('bookGen').value       = c.gen;
  document.getElementById('bookCoperta').value   = c.coperta;
  document.getElementById('bookLimba').value     = c.limba;
  document.getElementById('bookExemplare').value = c.exemplare;
  document.getElementById('bookModal').classList.remove('hidden');
}

function saveBook() {
  const editId = document.getElementById('bookEditId').value;
  const data = {
    titlu:     document.getElementById('bookTitlu').value.trim(),
    autor:     document.getElementById('bookAutor').value.trim(),
    editura:   document.getElementById('bookEditura').value.trim(),
    isbn:      document.getElementById('bookISBN').value.trim(),
    an:        parseInt(document.getElementById('bookAn').value) || new Date().getFullYear(),
    pagini:    parseInt(document.getElementById('bookPagini').value) || 0,
    gen:       document.getElementById('bookGen').value,
    coperta:   document.getElementById('bookCoperta').value,
    limba:     document.getElementById('bookLimba').value,
    exemplare: parseInt(document.getElementById('bookExemplare').value) || 1,
  };

  if (!data.titlu || !data.autor) {
    showToast('Titlul și autorul sunt obligatorii.');
    return;
  }

  if (editId) {
    const idx = db.carti.findIndex(c => c.id === editId);
    db.carti[idx] = { ...db.carti[idx], ...data };
    addLog('adaugare', `Carte actualizată: „${data.titlu}"`, currentUser.id);
    showToast('Cartea a fost actualizată!');
  } else {
    db.carti.push({ id: nextId('c'), disponibile: data.exemplare, ...data });
    addLog('adaugare', `Carte adăugată: „${data.titlu}"`, currentUser.id);
    showToast('Cartea a fost adăugată în catalog!');
  }

  closeModal('bookModal');
  renderCarti();
}

function deleteBook(id) {
  if (!confirm('Sigur vrei să ștergi această carte?')) return;
  const c = db.carti.find(x => x.id === id);
  db.carti = db.carti.filter(x => x.id !== id);
  addLog('adaugare', `Carte ștearsă: „${c.titlu}"`, currentUser.id);
  showToast('Cartea a fost ștearsă.');
  renderCarti();
}

/* ════════════════════════════════════════
   STUDENȚI
   ════════════════════════════════════════ */
function renderStudenti() {
  const students = db.users.filter(u => u.role === 'student');
  document.getElementById('studentiTable').innerHTML = students.map(s => {
    const imp = db.imprumuturi.filter(i => i.studentId === s.id).length;
    const statusClass = s.status === 'activ' ? 'badge--available' : s.status === 'pending' ? 'badge--pending' : 'badge--inactive';
    return `
    <tr>
      <td>
        <div class="student-cell">
          <div class="student-avatar-sm">${s.name[0]}</div>
          <div>
            <div class="student-name">${s.name}</div>
            <div class="student-sub">${s.id} · ${s.facultate || '—'}</div>
          </div>
        </div>
      </td>
      <td>${s.email}</td>
      <td>${s.dataInreg || '—'}</td>
      <td><span class="badge ${statusClass}">${s.status}</span></td>
      <td style="font-weight:600;">${imp}</td>
      <td>
        ${s.status === 'pending'
          ? `<button class="btn btn-gold btn-xs" onclick="approveStudent('${s.id}')">✓ Aprobă</button>`
          : s.status === 'activ'
            ? `<button class="btn btn-xs" style="border:1px solid var(--border);color:var(--text-muted);background:none;cursor:pointer;" onclick="deactivateStudent('${s.id}')">Dezactivează</button>`
            : '—'
        }
      </td>
    </tr>`;
  }).join('');
}

function approveStudent(id) {
  const u = db.users.find(x => x.id === id);
  if (!u) return;
  u.status = 'activ';
  addLog('aprobare', `Student aprobat: ${u.name}`, currentUser.id);
  showToast(`${u.name} a fost aprobat!`);
  renderStudenti();
  renderAprobari();
  renderDashboard();
}

function rejectStudent(id) {
  const u = db.users.find(x => x.id === id);
  if (!confirm(`Respingi cererea lui ${u?.name}?`)) return;
  db.users = db.users.filter(x => x.id !== id);
  addLog('aprobare', `Cerere respinsă: ${u?.name}`, currentUser.id);
  showToast('Cerere respinsă.');
  renderAprobari();
  renderStudenti();
}

function deactivateStudent(id) {
  const u = db.users.find(x => x.id === id);
  if (!u) return;
  u.status = 'inactiv';
  showToast(`${u.name} a fost dezactivat.`);
  renderStudenti();
}

/* ════════════════════════════════════════
   ÎMPRUMUTURI
   ════════════════════════════════════════ */
function renderImprumuturi() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('imprumututriTable').innerHTML = db.imprumuturi.map(i => {
    const carte   = db.carti.find(c => c.id === i.carteId);
    const student = db.users.find(u => u.id === i.studentId);
    const isOverdue = i.status === 'activ' && i.termen < today;
    const statusBadge = i.status === 'restituit' ? 'badge--available' : isOverdue ? 'badge--overdue' : 'badge--borrowed';
    const statusLabel = i.status === 'restituit' ? 'Restituit' : isOverdue ? 'Întârziat' : 'Activ';
    const isAdmin = currentUser && currentUser.role === 'bibliotecar';
    return `
    <tr>
      <td>
        <div style="font-weight:600;font-size:.875rem;">${carte?.titlu || 'N/A'}</div>
        <div class="book-isbn" style="font-size:.72rem;color:var(--text-light);">${carte?.isbn || ''}</div>
      </td>
      <td>${student?.name || 'N/A'}</td>
      <td>${i.dataImprumut}</td>
      <td style="${isOverdue ? 'color:var(--rust);font-weight:600;' : ''}">${i.termen}</td>
      <td><span class="badge ${statusBadge}">${statusLabel}</span></td>
      <td>
        ${i.status === 'activ' && isAdmin
          ? `<button class="btn btn-gold btn-xs" onclick="restituieCarte('${i.id}')">↩ Restituire</button>`
          : '—'}
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" style="padding:2rem;text-align:center;color:var(--text-light);">Niciun împrumut înregistrat.</td></tr>';
}

function showImprumutModal() {
  const carteSelect   = document.getElementById('imprumutCarte');
  const studentSelect = document.getElementById('imprumutStudent');

  carteSelect.innerHTML = db.carti
    .filter(c => c.disponibile > 0)
    .map(c => `<option value="${c.id}">${c.titlu} (${c.disponibile} disp.)</option>`)
    .join('');

  studentSelect.innerHTML = db.users
    .filter(u => u.role === 'student' && u.status === 'activ')
    .map(u => `<option value="${u.id}">${u.name}</option>`)
    .join('');

  const termen = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  document.getElementById('imprumutTermen').value = termen;
  document.getElementById('imprumutModal').classList.remove('hidden');
}

function saveImprumut() {
  const carteId   = document.getElementById('imprumutCarte').value;
  const studentId = document.getElementById('imprumutStudent').value;
  const termen    = document.getElementById('imprumutTermen').value;

  if (!carteId || !studentId || !termen) {
    showToast('Completați toate câmpurile.');
    return;
  }

  const carte   = db.carti.find(c => c.id === carteId);
  const student = db.users.find(u => u.id === studentId);

  db.imprumuturi.push({
    id: nextId('i'), carteId, studentId,
    dataImprumut: new Date().toISOString().split('T')[0],
    termen, status: 'activ'
  });
  carte.disponibile--;

  addLog('imprumut', `Împrumut: „${carte.titlu}" → ${student.name}`, currentUser.id);
  closeModal('imprumutModal');
  showToast('Împrumut înregistrat cu succes!');
  renderImprumuturi();
}

function restituieCarte(id) {
  const imp = db.imprumuturi.find(i => i.id === id);
  if (!imp) return;
  imp.status = 'restituit';
  const carte   = db.carti.find(c => c.id === imp.carteId);
  const student = db.users.find(u => u.id === imp.studentId);
  if (carte) carte.disponibile++;
  addLog('restituire', `Restituire: „${carte?.titlu}" ← ${student?.name}`, currentUser.id);
  showToast('Cartea a fost restituită!');
  renderImprumuturi();
}

/* ════════════════════════════════════════
   APROBĂRI
   ════════════════════════════════════════ */
function renderAprobari() {
  // Studenți în așteptare
  const pendingS = db.users.filter(u => u.status === 'pending');
  const ps = document.getElementById('pendingStudents');
  ps.innerHTML = pendingS.length
    ? pendingS.map(s => `
        <div class="approval-item">
          <div>
            <div class="approval-name">${s.name}</div>
            <div class="approval-sub">${s.email}</div>
            <div class="approval-sub">${s.facultate || 'N/A'} · Cerere: ${s.dataInreg || '—'}</div>
          </div>
          <div class="approval-btns">
            <button class="btn btn-gold btn-xs" onclick="approveStudent('${s.id}')">✓ Aprobă</button>
            <button class="btn btn-danger btn-xs" onclick="rejectStudent('${s.id}')">✗</button>
          </div>
        </div>
      `).join('')
    : '<p style="color:var(--text-light);font-size:.875rem;">Nicio cerere în așteptare.</p>';

  // Extinderi
  const extPending = db.extinderi.filter(e => e.status === 'pending');
  const er = document.getElementById('extendRequests');
  er.innerHTML = extPending.length
    ? extPending.map(e => {
        const carte   = db.carti.find(c => c.id === e.carteId);
        const student = db.users.find(u => u.id === e.studentId);
        return `
          <div class="approval-item" style="flex-direction:column;align-items:flex-start;">
            <div style="margin-bottom:.5rem;">
              <div class="approval-name">${carte?.titlu || 'N/A'}</div>
              <div class="approval-sub">Student: ${student?.name || '—'}</div>
              <div class="approval-sub" style="margin-top:.3rem;">Motiv: ${e.motiv}</div>
            </div>
            <div class="approval-btns">
              <button class="btn btn-gold btn-xs" onclick="approveExtindere('${e.id}')">✓ Aprobă +14 zile</button>
              <button class="btn btn-danger btn-xs" onclick="rejectExtindere('${e.id}')">✗ Respinge</button>
            </div>
          </div>`;
      }).join('')
    : '<p style="color:var(--text-light);font-size:.875rem;">Nicio solicitare de extindere.</p>';
}

function approveExtindere(id) {
  const e = db.extinderi.find(x => x.id === id);
  if (!e) return;
  e.status = 'aprobat';
  const imp = db.imprumuturi.find(i => i.id === e.imprumutId);
  if (imp) {
    const d = new Date(imp.termen);
    d.setDate(d.getDate() + 14);
    imp.termen = d.toISOString().split('T')[0];
  }
  const student = db.users.find(u => u.id === e.studentId);
  addLog('aprobare', `Extindere aprobată pentru ${student?.name}`, currentUser.id);
  showToast('Extindere aprobată! +14 zile adăugate.');
  renderAprobari();
}

function rejectExtindere(id) {
  const e = db.extinderi.find(x => x.id === id);
  if (e) e.status = 'respins';
  showToast('Extindere respinsă.');
  renderAprobari();
}

/* ════════════════════════════════════════
   ISTORIC
   ════════════════════════════════════════ */
function renderIstoric(list) {
  list = list || [...db.logs].reverse();
  document.getElementById('totalLogs').textContent = `${list.length} înregistrări`;

  const tipColors = {
    imprumut:   'badge--borrowed',
    restituire: 'badge--available',
    aprobare:   'badge--pending',
    adaugare:   'badge--available'
  };

  document.getElementById('istoricTable').innerHTML = list.map(l => `
    <tr>
      <td style="white-space:nowrap;font-size:.8rem;color:var(--text-muted);">${l.data}</td>
      <td><span class="badge ${tipColors[l.tip] || 'badge--pending'}">${l.tip}</span></td>
      <td>${l.desc}</td>
      <td style="font-size:.8rem;color:var(--text-light);">${l.user}</td>
    </tr>
  `).join('') || `<tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--text-light);">Nicio înregistrare.</td></tr>`;
}

function filterIstoric() {
  const q   = document.getElementById('searchIstoric').value.toLowerCase();
  const tip = document.getElementById('filterTipIstoric').value;
  let list  = [...db.logs].reverse();
  if (q)   list = list.filter(l => l.desc.toLowerCase().includes(q) || l.user.toLowerCase().includes(q));
  if (tip) list = list.filter(l => l.tip === tip);
  renderIstoric(list);
}

/* ════════════════════════════════════════
   ISBN / BARCODE
   ════════════════════════════════════════ */
function renderISBN() {
  const list = document.getElementById('isbnList');
  list.innerHTML = db.carti.map(c => `
    <button class="isbn-chip" onclick="loadISBN('${c.isbn}', '${c.titlu.replace(/'/g, "&#39;")}')">
      <span class="isbn-mono">${c.isbn}</span>
      <span class="isbn-book-name">${c.titlu}</span>
    </button>
  `).join('');
}

function loadISBN(isbn, title) {
  document.getElementById('isbnInput').value = isbn;
  document.getElementById('isbnTitle').value = title;
}

function generateBarcode() {
  const raw   = document.getElementById('isbnInput').value.trim().replace(/-/g, '');
  const title = document.getElementById('isbnTitle').value.trim();

  if (!raw) { showToast('Introduceți un ISBN valid.'); return; }

  const preview = document.getElementById('barcodePreview');
  preview.innerHTML = `
    <div class="barcode-result">
      <div class="barcode-title">${title || 'Cod de Bare ISBN'}</div>
      <svg id="barcodeCanvas"></svg>
      <div class="barcode-isbn-text">ISBN&nbsp;${raw.replace(/(\d{3})(\d{1})(\d{5})(\d{3})(\d{1})/, '$1-$2-$3-$4-$5')}</div>
      <button class="btn btn-gold btn-xs" style="margin-top:1rem;" onclick="printBarcode()">🖨️ Printează</button>
    </div>`;

  try {
    JsBarcode('#barcodeCanvas', raw, {
      format: 'EAN13', width: 2, height: 80,
      displayValue: true, fontSize: 13
    });
  } catch (e) {
    preview.innerHTML += '<p style="color:#e74c3c;font-size:.8rem;margin-top:.5rem;">ISBN invalid pentru EAN-13 (trebuie 13 cifre).</p>';
  }
}

function generateQR() {
  const isbn  = document.getElementById('isbnInput').value.trim();
  const title = document.getElementById('isbnTitle').value.trim();

  if (!isbn) { showToast('Introduceți un ISBN valid.'); return; }

  const preview = document.getElementById('barcodePreview');
  preview.innerHTML = `
    <div class="barcode-result">
      <div class="barcode-title">${title || 'QR Code ISBN'}</div>
      <div id="qrContainer" style="display:flex;justify-content:center;"></div>
      <div class="barcode-isbn-text">${isbn}</div>
    </div>`;

  new QRCode(document.getElementById('qrContainer'), {
    text: `ISBN ${isbn}`,
    width: 180, height: 180,
    colorDark: '#1a1410', colorLight: '#faf7f2'
  });
}

function printBarcode() {
  const content = document.getElementById('barcodePreview').innerHTML;
  const w = window.open('', '_blank');
  w.document.write(`
    <html><head><title>Cod de Bare</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&display=swap" rel="stylesheet">
    <style>body{font-family:'DM Sans',sans-serif;text-align:center;padding:3rem;background:#fff;}</style>
    </head><body>${content}</body></html>`);
  w.document.close();
  w.print();
}
