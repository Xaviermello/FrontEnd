/**
 * CEEP — assets/js/schedule-form.js
 * Painel de aulas, formulário de reserva e modal
 */

const SchForm = (() => {

  let currentDateStr = null;
  let selectedAulas  = new Set();

  // ---- RENDERIZA AULAS DO DIA ----
  function renderAulas(dateStr, dateObj) {
    currentDateStr = dateStr;
    selectedAulas.clear();

    const activeLab = SchApp.getActiveLab();
    const lab       = SchData.getLabById(activeLab);

    // Atualiza título e badge
    document.getElementById('schSchedTitle').textContent =
      dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
             .replace(/^\w/, c => c.toUpperCase());
    document.getElementById('schLabBadge').textContent = lab ? lab.nome : '';

    // Fecha form se aberto
    document.getElementById('schFormCard').style.display = 'none';

    const container = document.getElementById('schAulasContainer');
    const aulasList = SchData.getReservasDoDia(activeLab, dateStr);

    const grid = document.createElement('div');
    grid.className = 'sch-aulas-grid';

    aulasList.forEach(aula => {
      const card = document.createElement('div');
      card.className = `sch-aula-card${aula.reserva ? ' occupied' : ''}`;
      card.dataset.num = aula.num;

      const check = document.createElement('div');
      check.className = 'sch-aula-check';
      check.textContent = '✓';

      const ownerHTML = aula.reserva
        ? `<div class="sch-aula-owner">👤 ${aula.reserva.nome}${aula.reserva.turma ? ' · ' + aula.reserva.turma : ''}</div>`
        : '';

      card.innerHTML = `
        <div class="sch-aula-num">Aula ${aula.num}</div>
        <div class="sch-aula-time">${aula.inicio} – ${aula.fim}</div>
        <span class="sch-aula-status ${aula.reserva ? 'sch-status-occupied' : 'sch-status-free'}">
          ${aula.reserva ? 'Reservado' : 'Disponível'}
        </span>
        ${ownerHTML}
      `;
      card.appendChild(check);

      if (!aula.reserva) {
        card.addEventListener('click', () => toggleAula(card, aula.num));
      }

      grid.appendChild(card);
    });

    // Barra de reserva
    const bar = document.createElement('div');
    bar.className = 'sch-reserve-bar';
    bar.innerHTML = `
      <div class="sch-reserve-info">
        <strong id="schSelCount">0</strong> aula(s) selecionada(s)
      </div>
      <button class="sch-btn-reserve" id="schReserveBtn" disabled>⊕ Reservar Selecionadas</button>
    `;

    container.innerHTML = '';
    container.appendChild(grid);
    container.appendChild(bar);

    document.getElementById('schReserveBtn').addEventListener('click', openForm);
  }

  function toggleAula(card, num) {
    if (selectedAulas.has(num)) {
      selectedAulas.delete(num);
      card.classList.remove('selected');
    } else {
      selectedAulas.add(num);
      card.classList.add('selected');
    }
    updateBar();
  }

  function updateBar() {
    const countEl = document.getElementById('schSelCount');
    const btn     = document.getElementById('schReserveBtn');
    if (countEl) countEl.textContent = selectedAulas.size;
    if (btn)     btn.disabled = selectedAulas.size === 0;
  }

  // ---- FORM ----
  function openForm() {
    if (!selectedAulas.size) return;

    const activeLab = SchApp.getActiveLab();
    const lab       = SchData.getLabById(activeLab);
    const [y, m, d] = currentDateStr.split('-').map(Number);
    const dateObj   = new Date(y, m - 1, d);
    const dateFmt   = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                             .replace(/^\w/, c => c.toUpperCase());

    document.getElementById('schFormInfo').textContent = `📅 ${dateFmt}  ·  🏫 ${lab ? lab.nome : ''}`;
    document.getElementById('schNome').value  = '';
    document.getElementById('schTurma').value = '';

    const chips = document.getElementById('schChips');
    chips.innerHTML = '';
    [...selectedAulas].sort((a, b) => a - b).forEach(num => {
      const cfg  = SchData.AULAS.find(a => a.num === num);
      const chip = document.createElement('span');
      chip.className   = 'sch-chip';
      chip.textContent = `Aula ${num}  ${cfg.inicio}–${cfg.fim}`;
      chips.appendChild(chip);
    });

    document.getElementById('schFormCard').style.display = 'block';
    document.getElementById('schFormCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function closeForm() {
    document.getElementById('schFormCard').style.display = 'none';
  }

  function confirmReserva() {
    const nome  = document.getElementById('schNome').value.trim();
    const turma = document.getElementById('schTurma').value.trim();

    if (!nome) {
      const input = document.getElementById('schNome');
      input.focus();
      input.style.borderColor = '#d91530';
      return;
    }
    document.getElementById('schNome').style.borderColor = '';

    const activeLab   = SchApp.getActiveLab();
    const lab         = SchData.getLabById(activeLab);
    const aulaNumbers = [...selectedAulas];
    SchData.salvar(activeLab, currentDateStr, aulaNumbers, nome, turma);

    const [y, m, d] = currentDateStr.split('-').map(Number);
    const dateObj   = new Date(y, m - 1, d);
    const dateFmt   = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
                             .replace(/^\w/, c => c.toUpperCase());

    document.getElementById('schModalMsg').innerHTML =
      `<strong>${nome}</strong> reservou <strong>${aulaNumbers.length} aula(s)</strong><br>
       no <strong>${lab ? lab.nome : ''}</strong><br>
       em <strong>${dateFmt}</strong>
       ${turma ? `<br><em>${turma}</em>` : ''}`;

    document.getElementById('schModal').style.display = 'flex';

    selectedAulas.clear();
    closeForm();
    SchCalendar.refresh();
    renderAulas(currentDateStr, dateObj);
    SchCalendar.renderWeeklySummary(dateObj);
  }

  // ---- INIT ----
  function init() {
    document.getElementById('schCloseForm').addEventListener('click', closeForm);
    document.getElementById('schCancelBtn').addEventListener('click', closeForm);
    document.getElementById('schConfirmBtn').addEventListener('click', confirmReserva);
    document.getElementById('schModalClose').addEventListener('click', () => {
      document.getElementById('schModal').style.display = 'none';
    });
  }

  return { init, renderAulas };

})();