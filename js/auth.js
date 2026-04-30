// ============================================================
//  auth.js — login / logout / registration
// ============================================================

const Auth = (() => {
  let currentUser = null;

  function getCurrent() { return currentUser; }
  function isAdmin()    { return currentUser && currentUser.role === 'bibliotecar'; }

  // ---- login ----
  function showRegisterScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'flex';
  }

  function showLoginScreen() {
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
  }

  function login() {
    if (!DB.ready) {
      alert('Se incarca datele din baza de date. Incearca din nou in cateva secunde.');
      return;
    }
    if (!DB.online) {
      alert('Backend/MySQL indisponibil. Ruleaza aplicatia prin Apache/PHP (nu file://).');
      return;
    }
    const uid  = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    const role = document.getElementById('loginRole').value;

    const user = DB.users.find(u => u.id === uid && u.pass === pass && u.role === role);

    if (!user) {
      document.getElementById('loginErr').style.display = 'block';
      return;
    }
    if (user.status === 'pending') {
      alert('Contul tău este în așteptarea aprobării bibliotecarului.');
      return;
    }

    currentUser = user;
    document.getElementById('loginErr').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'none';
    const appEl = document.getElementById('app');
    appEl.style.display = 'flex';
    appEl.classList.remove('sidebar-open');
    appEl.classList.add('sidebar-collapsed');

    // populate sidebar user info
    document.getElementById('userAvatar').textContent      = user.name[0];
    document.getElementById('userNameDisplay').textContent = user.name;
    document.getElementById('userRoleDisplay').textContent = isAdmin() ? 'Administrator' : 'Student';

    applyRoleUI();
    Nav.showPage('dashboard');
  }

  // ---- logout ----
  function logout() {
    currentUser = null;
    const appEl = document.getElementById('app');
    appEl.style.display = 'none';
    appEl.classList.remove('sidebar-open');
    appEl.classList.add('sidebar-collapsed');
    document.getElementById('loginScreen').style.display   = 'flex';
    document.getElementById('loginPass').value = '';
  }

  // ---- register (student request) ----
  function showRegModal()  { Modal.open('regModal'); }

  async function registerFromPage() {
    if (!DB.online) {
      alert('Nu exista conexiune cu backend-ul MySQL. Verifica Apache/MySQL si backend/config.php.');
      return;
    }
    const name  = document.getElementById('registerNume').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const uid   = document.getElementById('registerId').value.trim();
    const pass  = document.getElementById('registerPass').value.trim();
    const fac   = document.getElementById('registerFac').value.trim();

    if (!name || !email || !uid || !pass) { alert('Completați toate câmpurile obligatorii.'); return; }
    if (DB.users.find(u => u.id === uid))  { alert('ID-ul este deja folosit. Alegeți altul.'); return; }

    DB.users.push({
      id: uid, pass, role: 'student',
      name, email, facultate: fac, status: 'pending',
      dataInreg: new Date().toISOString().split('T')[0]
    });

    DB.addLog('aprobare', `Cerere înregistrare nouă: ${name}`, 'sistem');
    await DB.saveState();
    ['registerNume','registerEmail','registerId','registerPass','registerFac'].forEach(id => document.getElementById(id).value = '');
    showLoginScreen();
    UI.toast('Cerere trimisă! Așteptați aprobarea bibliotecarului.');
  }

  async function doRegister() {
    if (!DB.online) {
      alert('Nu exista conexiune cu backend-ul MySQL. Verifica Apache/MySQL si backend/config.php.');
      return;
    }
    const name  = document.getElementById('regNume').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const uid   = document.getElementById('regId').value.trim();
    const pass  = document.getElementById('regPass').value.trim();
    const fac   = document.getElementById('regFac').value.trim();

    if (!name || !email || !uid || !pass) { alert('Completați toate câmpurile obligatorii.'); return; }
    if (DB.users.find(u => u.id === uid))  { alert('ID-ul este deja folosit. Alegeți altul.'); return; }

    DB.users.push({
      id: uid, pass, role: 'student',
      name, email, facultate: fac, status: 'pending',
      dataInreg: new Date().toISOString().split('T')[0]
    });

    DB.addLog('aprobare', `Cerere înregistrare nouă: ${name}`, 'sistem');
    await DB.saveState();
    Modal.close('regModal');
    UI.toast('Cerere trimisă! Așteptați aprobarea bibliotecarului.');
    ['regNume','regEmail','regId','regPass','regFac'].forEach(id => document.getElementById(id).value = '');
  }

  // ---- role-based UI ----
  function applyRoleUI() {
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = isAdmin() ? '' : 'none';
    });
  }

  return {
    login, logout, showRegModal, doRegister, registerFromPage,
    showRegisterScreen, showLoginScreen, getCurrent, isAdmin, applyRoleUI
  };
})();
