/* db.js — BibliotecaApp
   Toate datele aplicației (simulare bază de date în memorie)
*/

const db = {
  users: [
    {
      id: 'admin01', pass: '1234', role: 'bibliotecar',
      name: 'Maria Ionescu', email: 'admin@biblioteca.ro',
      status: 'activ', facultate: '', dataInreg: '2023-09-01'
    },
    {
      id: 'student01', pass: 'pass', role: 'student',
      name: 'Andrei Munteanu', email: 'andrei.m@univ.ro',
      status: 'activ', facultate: 'Litere', dataInreg: '2024-09-01'
    },
    {
      id: 'student02', pass: 'pass', role: 'student',
      name: 'Elena Dumitrescu', email: 'elena.d@univ.ro',
      status: 'activ', facultate: 'Drept', dataInreg: '2024-09-05'
    },
    {
      id: 'student03', pass: 'pass', role: 'student',
      name: 'Mihai Popescu', email: 'mihai.p@univ.ro',
      status: 'pending', facultate: 'Medicina', dataInreg: '2025-01-10'
    },
  ],

  carti: [
    {
      id: 'c1',
      titlu: 'Dar dacă... DUMNEZEU are alte planuri?',
      autor: 'Charles R. Swindoll',
      editura: 'Stephanus',
      an: 2022,
      isbn: '978-606-698-056-2',
      pagini: 228,
      gen: 'Religie',
      coperta: 'Paperback',
      limba: 'Romana',
      exemplare: 2,
      disponibile: 1
    },
    {
      id: 'c2',
      titlu: 'Creierul Uman',
      autor: 'Alexandru Vlad Ciurea',
      editura: 'Bookzone',
      an: 2022,
      isbn: '9786069639696',
      pagini: 272,
      gen: 'Medicina',
      coperta: 'Brosata',
      limba: 'Romana',
      exemplare: 1,
      disponibile: 0
    },
    {
      id: 'c3',
      titlu: 'Micul Prinț',
      autor: 'Antoine de Saint-Exupery',
      editura: 'EDITURA CREATOR',
      an: 2026,
      isbn: '978-630-370-003-8',
      pagini: 98,
      gen: 'Literatura Universala',
      coperta: 'Necartonata',
      limba: 'Romana',
      exemplare: 3,
      disponibile: 3
    },
    {
      id: 'c4',
      titlu: '1984',
      autor: 'George Orwell',
      editura: 'RAO',
      an: 2019,
      isbn: '978-606-006-189-8',
      pagini: 312,
      gen: 'Fictiune',
      coperta: 'Paperback',
      limba: 'Romana',
      exemplare: 2,
      disponibile: 2
    },
  ],

  imprumuturi: [
    {
      id: 'i1', carteId: 'c2', studentId: 'student01',
      dataImprumut: '2025-01-05', termen: '2025-02-05', status: 'activ'
    },
    {
      id: 'i2', carteId: 'c1', studentId: 'student02',
      dataImprumut: '2025-01-15', termen: '2025-02-15', status: 'restituit'
    },
  ],

  extinderi: [
    {
      id: 'e1', studentId: 'student01', carteId: 'c2',
      imprumutId: 'i1', motiv: 'Nu am terminat cartea.',
      status: 'pending', data: '2025-01-20'
    },
  ],

  logs: [
    { id: 'l1', data: '2024-12-01 10:00', tip: 'adaugare',  desc: 'Carte adăugată: „Micul Prinț"',                   user: 'admin01' },
    { id: 'l2', data: '2024-12-05 09:00', tip: 'aprobare',  desc: 'Student aprobat: Andrei Munteanu',                 user: 'admin01' },
    { id: 'l3', data: '2025-01-05 09:30', tip: 'imprumut',  desc: 'Împrumut: „Creierul Uman" → Andrei Munteanu',      user: 'admin01' },
    { id: 'l4', data: '2025-01-15 11:00', tip: 'imprumut',  desc: 'Împrumut: „Dar dacă..." → Elena Dumitrescu',       user: 'admin01' },
    { id: 'l5', data: '2025-01-16 14:22', tip: 'restituire',desc: 'Restituire: „Dar dacă..." ← Elena Dumitrescu',     user: 'admin01' },
  ]
};

/* ── Helpers ── */
function addLog(tip, desc, user) {
  const now  = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().substring(0, 5);
  db.logs.push({ id: 'l' + Date.now(), data: `${date} ${time}`, tip, desc, user });
}

function nextId(prefix) {
  return prefix + Date.now();
}
