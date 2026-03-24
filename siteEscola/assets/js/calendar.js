/**
 * CEEP — assets/js/schedule-calendar.js
 * Renderização e navegação do calendário
 */

const SchCalendar = (() => {

  let currentYear  = new Date().getFullYear();
  let currentMonth = new Date().getMonth();
  let selectedDate = null;

  function init() {
    document.getElementById('schPrevMonth').addEventListener('click', () => navigate(-1));
    document.getElementById('schNextMonth').addEventListener('click', () => navigate(1));
    render();
  }

  function navigate(delta) {
    const today   = new Date();
    const maxDate = SchData.getMaxDate();
    let nm = currentMonth + delta;
    let ny = currentYear;
    if (nm < 0)  { nm = 11; ny--; }
    if (nm > 11) { nm = 0;  ny++; }
    if (ny < today.getFullYear() || (ny === today.getFullYear() && nm < today.getMonth())) return;
    if (ny > maxDate.getFullYear() || (ny === maxDate.getFullYear() && nm > maxDate.getMonth())) return;
    currentMonth = nm;
    currentYear  = ny;
    render();
  }

  function render() {
    const grid    = document.getElementById('schCalGrid');
    const title   = document.getElementById('schMonthTitle');
    const today   = new Date();
    const maxDate = SchData.getMaxDate();
    const activeLab = SchApp ? SchApp.getActiveLab() : null;

    title.textContent = `${SchData.MONTH_NAMES[currentMonth]} ${currentYear}`;
    grid.innerHTML = '';

    const firstDay    = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Células vazias
    for (let i = 0; i < firstDay; i++) {
      const el = document.createElement('div');
      el.className = 'sch-day empty';
      grid.appendChild(el);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date      = new Date(currentYear, currentMonth, d);
      const dateStr   = SchData.toStr(date);
      const isToday   = isSameDay(date, today);
      const isPast    = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isOver    = date > maxDate;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      const el = document.createElement('div');
      el.className = 'sch-day';

      const numSpan = document.createElement('span');
      numSpan.className = 'sch-day-num';
      numSpan.textContent = d;
      el.appendChild(numSpan);

      if (isPast || isOver || isWeekend) {
        el.classList.add(isPast ? 'past' : isOver ? 'blocked' : 'weekend');
      } else {
        const status = activeLab ? SchData.getDayStatus(activeLab, dateStr) : 'free';

        if (status === 'full') {
          el.classList.add('has-full');
        } else {
          el.classList.add(status === 'partial' ? 'has-partial' : 'available');
          el.addEventListener('click', () => selectDate(dateStr, date));
        }

        // Mini dots
        if (activeLab) {
          const occ = SchData.getReservasDoDia(activeLab, dateStr).filter(r => r.reserva).length;
          if (occ > 0) {
            const dotRow = document.createElement('div');
            dotRow.className = 'sch-dot-row';
            for (let i = 0; i < Math.min(occ, 3); i++) {
              const dot = document.createElement('span');
              dot.className = 'sch-mini-dot';
              dotRow.appendChild(dot);
            }
            el.appendChild(dotRow);
          }
        }
      }

      if (isToday) el.classList.add('today');
      if (selectedDate === dateStr) el.classList.add('selected');
      grid.appendChild(el);
    }
  }

  function selectDate(dateStr, dateObj) {
    selectedDate = dateStr;
    render();
    SchForm.renderAulas(dateStr, dateObj);
    renderWeeklySummary(dateObj);
  }

  function renderWeeklySummary(refDate) {
    const container = document.getElementById('schWeekly');
    const activeLab = SchApp ? SchApp.getActiveLab() : null;

    if (!activeLab) {
      container.innerHTML = '<p class="sch-empty-week">Selecione um laboratório.</p>';
      return;
    }

    const entries = SchData.getReservasDaSemana(activeLab, refDate);
    if (!entries.length) {
      container.innerHTML = '<p class="sch-empty-week">Nenhuma reserva nesta semana.</p>';
      return;
    }

    const grouped = {};
    entries.forEach(e => {
      if (!grouped[e.dateStr]) grouped[e.dateStr] = [];
      grouped[e.dateStr].push(e);
    });

    container.innerHTML = '';
    Object.keys(grouped).sort().forEach(ds => {
      const [y, m, d] = ds.split('-').map(Number);
      const dObj = new Date(y, m - 1, d);
      const dayLabel = `${SchData.WEEKDAY_NAMES[dObj.getDay()]}, ${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}`;

      const byProf = {};
      grouped[ds].forEach(e => {
        const k = e.reserva.nome;
        if (!byProf[k]) byProf[k] = { ...e.reserva, aulas: [] };
        byProf[k].aulas.push(e.aula.num);
      });

      Object.values(byProf).forEach(prof => {
        const entry = document.createElement('div');
        entry.className = 'sch-week-entry';
        entry.innerHTML = `
          <span class="we-day">${dayLabel}</span>
          <span class="we-name">${prof.nome}</span>
          <span class="we-det">${prof.turma || ''} · Aula${prof.aulas.length > 1 ? 's' : ''} ${prof.aulas.join(', ')}</span>
        `;
        container.appendChild(entry);
      });
    });
  }

  function resetSelected() {
    selectedDate = null;
  }

  function refresh() {
    render();
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      renderWeeklySummary(new Date(y, m - 1, d));
    }
  }

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth()    &&
           a.getDate()     === b.getDate();
  }

  return { init, render, refresh, resetSelected, renderWeeklySummary };

})();