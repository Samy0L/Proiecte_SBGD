/* auth.js — BibliotecaApp
   Autentificare, înregistrare, gestionare sesiune
*/

let currentUser = null;

/* ── LOGIN ── */
function doLogin() {
  const uid  = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const role = document.getElementById('loginRole').value;

  const user = db.users.find(u => u.id === uid && u.pass === pass && u.role === role);

  if (!user) {
    document.getElementById('loginErr').classList.remove('hidden');
    return;
  }

  if (user.status === 'pending') {
    showToast('Contul tău este în așteptarea aprobării bibliotecarului.');
    return;
  }

  currentUser = user;
  document.getElementById('loginErr').classList.add('hidden');
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');

  document.getElementById('userNameDisplay').textContent = user.name;
  document.getElementById('userRoleDisplay').textContent =
    user.role === 'bibliotecar' ? 'Administrator' : 'Student';
  document.getElementById('userAvatar').textContent = user.name[0].toUpperCase();

  applyRoleUI();
  showPage('dashboard');
}

/* ── LOGOUT ── */
function doLogout() {
  currentUser = null;
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginPass').value = '';
}

/* ── REGISTER (student) ── */
function showRegModal() {
  document.getElementById('regModal').classList.remove('hidden');
}

function doRegister() {
  const name  = document.getElementById('regNume').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const uid   = document.getElementById('regId').value.trim();
  const pass  = document.getElementById('regPass').value.trim();
  const fac   = document.getElementById('regFac').value.trim();

  if (!name || !email || !uid || !pass) {
    showToast('Completați toate câmpurile obligatorii.');
    return;
  }

  if (db.users.find(u => u.id === uid)) {
    showToast('ID-ul este deja utilizat. Alegeți altul.');
    return;
  }

  db.users.push({
    id: uid, pass, role: 'student',
    name, email, status: 'pending',
    facultate: fac,
    dataInreg: new Date().toISOString().split('T')[0]
  });

  addLog('aprobare', `Cerere înregistrare nouă: ${name}`, 'sistem');
  closeModal('regModal');
  showToast('Cerere trimisă! Așteptați aprobarea bibliotecarului.');

  // clear form
  ['regNume','regEmail','regId','regPass','regFac'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

/* ── ROLE-BASED UI ── */
function applyRoleUI() {
  const isAdmin = currentUser && currentUser.role === 'bibliotecar';
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });
}

/* ── Keyboard: Enter on login ── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginPass').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
});
