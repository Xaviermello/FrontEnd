/**
 * CEEP — assets/js/schedule-data.js
 * Dados: laboratórios, reservas, localStorage
 */

const SchData = (() => {

  const STORAGE_KEY = 'ceep_reservas_v2';
  const LABS_KEY    = 'ceep_labs_v2';

  const AULAS = [
    { num: 1, inicio: '07:30', fim: '08:20' },
    { num: 2, inicio: '08:20', fim: '09:10' },
    { num: 3, inicio: '09:10', fim: '10:00' },
    { num: 4, inicio: '10:20', fim: '11:10' },
    { num: 5, inicio: '11:10', fim: '12:00' },
    { num: 6, inicio: '13:00', fim: '13:50' }
  ];

  const MONTH_NAMES   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const WEEKDAY_NAMES = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  // ---- LABS ----
  function getDefaultLabs() {
    return [
      { id: 'lab_multi',   nome: 'Lab Multimídia',  icone: '🖥' },
      { id: 'lab_info',    nome: 'Lab Informática',  icone: '💻' },
      { id: 'lab_linguas', nome: 'Lab de Línguas',   icone: '📚' }
    ];
  }

  function getLabs() {
    try {
      const stored = JSON.parse(localStorage.getItem(LABS_KEY));
      return stored && stored.length ? stored : getDefaultLabs();
    } catch { return getDefaultLabs(); }
  }

  function getLabById(id) {
    return getLabs().find(l => l.id === id) || null;
  }

  // ---- RESERVAS ----
  function getReservas() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }

  function saveReservas(r) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
  }

  function makeKey(labId, dateStr, num) {
    return `${labId}_${dateStr}_${num}`;
  }

  function salvar(labId, dateStr, aulaNumbers, nome, turma) {
    const r = getReservas();
    aulaNumbers.forEach(num => {
      r[makeKey(labId, dateStr, num)] = { nome, turma, labId, dateStr, aulaNum: num, ts: Date.now() };
    });
    saveReservas(r);
  }

  function getReservasDoDia(labId, dateStr) {
    const r = getReservas();
    return AULAS.map(a => ({ ...a, reserva: r[makeKey(labId, dateStr, a.num)] || null }));
  }

  function getDayStatus(labId, dateStr) {
    const r = getReservas();
    let occ = 0;
    AULAS.forEach(a => { if (r[makeKey(labId, dateStr, a.num)]) occ++; });
    if (occ === 0) return 'free';
    if (occ >= AULAS.length) return 'full';
    return 'partial';
  }

  function getReservasDaSemana(labId, refDate) {
    const r = getReservas();
    const result = [];
    const inicio = new Date(refDate);
    inicio.setDate(refDate.getDate() - refDate.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      const ds = toStr(d);
      AULAS.forEach(a => {
        const key = makeKey(labId, ds, a.num);
        if (r[key]) result.push({ date: d, dateStr: ds, aula: a, reserva: r[key] });
      });
    }
    return result;
  }

  // ---- UTILS ----
  function toStr(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }

  function getMaxDate() {
    const m = new Date();
    m.setDate(m.getDate() + 14);
    return m;
  }

  return {
    AULAS,
    MONTH_NAMES,
    WEEKDAY_NAMES,
    getLabs,
    getLabById,
    salvar,
    getReservasDoDia,
    getDayStatus,
    getReservasDaSemana,
    toStr,
    getMaxDate
  };

})();