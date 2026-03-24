/**
 * CEEP — Agendamento de Laboratórios
 * js/schedule.js — painel de aulas e formulário de reserva
 */

const Schedule = (() => {
  let currentDateStr = null;
  let selectedAulas  = new Set();

  function loadDay(dateStr, dateObj) {
    currentDateStr = dateStr;
    selectedAulas.clear();

    const activeLab = App.getActiveLab();
    const labName   = LABS[activeLab];

    // Update header
    document.getElementById('scheduleTitle').textContent =
      dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
        .replace(/^\w/, c => c.toUpperCase());

    const badge = document.getElementById('labBadge');
    badge.textContent = labName;

    // Hide form
    document.getElementById('reservaFormCard').style.display = 'none';

    // Render aulas
    renderAulas(activeLab, dateStr);
  }

  function renderAulas(lab, dateStr) {
    const container = document.getElementById('aulasContainer');
    const aulasList = getReservasDoDia(lab, dateStr);

    const grid = document.createElement('div');
    grid.className = 'aulas-grid';

    aulasList.forEach(aula => {
      const card = document.createElement('div');
      card.className = `aula-card ${aula.reserva ? 'occupied' : ''}`;
      card.dataset.num = aula.num;

      const check = document.createElement('div');
      check.className = 'aula-check';
      check.textContent = '✓';

      card.innerHTML = `
        <div class="aula-num">Aula ${aula.num}</div>
        <div class="aula-time">${aula.inicio} – ${aula.fim}</div>
        <span class="aula-status ${aula.reserva ? 'status-occupied' : 'status-free'}">
          ${aula.reserva ? 'Reservado' : 'Disponível'}
        </span>
        ${aula.reserva ? `<div class="aula-owner">👤 ${aula.reserva.nome}${aula.reserva.turma ? ' · ' + aula.reserva.turma : ''}</div>` : ''}
      `;
      card.appendChild(check);

      if (!aula.reserva) {
        card.addEventListener('click', () => toggleAula(card, aula.num));
      }

      grid.appendChild(card);
    });

    // Reserve bar
    const bar = document.createElement('div');
    bar.className = 'reserve-bar';
    bar.id = 'reserveBar';
    bar.innerHTML = `
      <div class="reserve-bar-info">
        <strong id="selectedCount">0</strong> aula(s) selecionada(s)
      </div>
      <button class="btn-reserve" id="reserveBtn" disabled>
        ⊕ Reservar Selecionadas
      </button>
    `;

    container.innerHTML = '';
    container.appendChild(grid);
    container.appendChild(bar);

    document.getElementById('reserveBtn').addEventListener('click', openForm);
  }

  function toggleAula(card, num) {
    if (selectedAulas.has(num)) {
      selectedAulas.delete(num);
      card.classList.remove('selected');
    } else {
      selectedAulas.add(num);
      card.classList.add('selected');
    }
    updateReserveBar();
  }

  function updateReserveBar() {
    const countEl = document.getElementById('selectedCount');
    const btn     = document.getElementById('reserveBtn');
    if (countEl) countEl.textContent = selectedAulas.size;
    if (btn) btn.disabled = selectedAulas.size === 0;
  }

  function openForm() {
    if (selectedAulas.size === 0) return;
    const activeLab = App.getActiveLab();

    // Info bar
    const labName = LABS[activeLab];
    const [y, m, d] = currentDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    document.getElementById('formInfoBar').textContent =
      `📅 ${dateFormatted.replace(/^\w/, c => c.toUpperCase())}  ·  🏫 ${labName}`;

    // Chips
    const chips = document.getElementById('aulasChips');
    chips.innerHTML = '';
    [...selectedAulas].sort((a,b) => a - b).forEach(num => {
      const cfg = AULAS_CONFIG.find(a => a.num === num);
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = `Aula ${num}  ${cfg.inicio}–${cfg.fim}`;
      chips.appendChild(chip);
    });

    // Clear inputs
    document.getElementById('nomeInput').value  = '';
    document.getElementById('turmaInput').value = '';

    document.getElementById('reservaFormCard').style.display = 'block';
    document.getElementById('reservaFormCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function closeForm() {
    document.getElementById('reservaFormCard').style.display = 'none';
  }

  function confirmReserva() {
    const nome  = document.getElementById('nomeInput').value.trim();
    const turma = document.getElementById('turmaInput').value.trim();

    if (!nome) {
      document.getElementById('nomeInput').focus();
      document.getElementById('nomeInput').style.borderColor = 'var(--red-bright)';
      return;
    }
    document.getElementById('nomeInput').style.borderColor = '';

    const activeLab = App.getActiveLab();
    const aulaNumbers = [...selectedAulas];

    salvarReserva(activeLab, currentDateStr, aulaNumbers, nome, turma);

    // Show modal
    const labName = LABS[activeLab];
    const [y, m, d] = currentDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long'
    });

    document.getElementById('modalMsg').innerHTML =
      `<strong>${nome}</strong> reservou <strong>${aulaNumbers.length} aula(s)</strong><br>
       no <strong>${labName}</strong><br>
       em <strong>${dateFormatted.replace(/^\w/, c => c.toUpperCase())}</strong><br>
       ${turma ? `<em>Turma: ${turma}</em>` : ''}`;

    document.getElementById('modalOverlay').style.display = 'flex';

    // Reset
    selectedAulas.clear();
    closeForm();

    // Refresh calendar & schedule
    Calendar.refresh();
    loadDay(currentDateStr, dateObj);
  }

  function init() {
    document.getElementById('closeFormBtn').addEventListener('click', closeForm);
    document.getElementById('cancelBtn').addEventListener('click', closeForm);
    document.getElementById('confirmBtn').addEventListener('click', confirmReserva);
    document.getElementById('modalClose').addEventListener('click', () => {
      document.getElementById('modalOverlay').style.display = 'none';
    });
  }

  return { init, loadDay };
})();
