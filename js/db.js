// ============================================================
//  db.js — app state backed by MySQL (PHP API)
// ============================================================

const DB = {
  apiUrl: '',
  ready: false,
  online: false,
  users: [],
  carti: [],
  imprumuturi: [],
  extinderi: [],
  logs: [],
};

DB.getApiUrl = function() {
  if (DB.apiUrl) return DB.apiUrl;
  const basePath = window.location.pathname.replace(/\/[^/]*$/, '/');
  DB.apiUrl = `${basePath}backend/api.php`;
  return DB.apiUrl;
};

DB._seedFallback = {
  users: [
    { id: 'admin01', pass: '1234', role: 'bibliotecar', name: 'Maria Ionescu', email: 'admin@biblioteca.ro', status: 'activ', facultate: '', dataInreg: '2024-01-01' },
    { id: 'student01', pass: 'pass', role: 'student', name: 'Andrei Munteanu', email: 'andrei.m@univ.ro', status: 'activ', facultate: 'Litere', dataInreg: '2024-09-01' },
  ],
  carti: [],
  imprumuturi: [],
  extinderi: [],
  logs: [],
};

DB.api = async function(action, method = 'GET', body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const url = `${DB.getApiUrl()}?action=${encodeURIComponent(action)}`;
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok || data.ok === false) throw new Error(data.error || 'Eroare API');
  return data;
};

DB.init = async function() {
  const apiUrl = DB.getApiUrl();
  try {
    const data = await DB.api('state');
    DB.users = data.users || [];
    DB.carti = data.carti || [];
    DB.imprumuturi = data.imprumuturi || [];
    DB.extinderi = data.extinderi || [];
    DB.logs = data.logs || [];
    DB.online = true;
    DB.ready = true;
  } catch (err) {
    console.error(`Nu s-a putut încărca baza de date de la ${apiUrl}:`, err);
    DB.users = [...DB._seedFallback.users];
    DB.carti = [...DB._seedFallback.carti];
    DB.imprumuturi = [...DB._seedFallback.imprumuturi];
    DB.extinderi = [...DB._seedFallback.extinderi];
    DB.logs = [...DB._seedFallback.logs];
    DB.online = false;
    DB.ready = true;
    if (window.UI && typeof UI.toast === 'function') {
      UI.toast(`Backend indisponibil (${apiUrl}).`);
    }
  }
};

DB.saveState = async function() {
  try {
    await DB.api('save_state', 'POST', {
      users: DB.users,
      carti: DB.carti,
      imprumuturi: DB.imprumuturi,
      extinderi: DB.extinderi,
      logs: DB.logs,
    });
    DB.lastSaveError = null;
    return true;
  } catch (err) {
    DB.lastSaveError = err;
    console.error('Salvarea in MySQL a esuat:', err);
    if (window.UI && typeof UI.toast === 'function') {
      UI.toast('Actiunea s-a facut local, dar nu s-a salvat in MySQL.');
    }
    return false;
  }
};

// ---- helpers ----
DB.findUser    = (id) => DB.users.find(u => u.id === id);
DB.findCarte   = (id) => DB.carti.find(c => c.id === id);
DB.findImprumut = (id) => DB.imprumuturi.find(i => i.id === id);

DB.addLog = function(tip, desc, userId) {
  const now  = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().substring(0, 5);
  DB.logs.push({ id: 'l' + Date.now(), data: `${date} ${time}`, tip, desc, user: userId });
};

DB.nextId = () => String(Date.now());

window.addEventListener('DOMContentLoaded', async () => {
  await DB.init();
});
