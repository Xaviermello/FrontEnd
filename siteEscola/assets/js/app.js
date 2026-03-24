/**
 * CEEP — assets/js/schedule-app.js
 * Controlador principal: seletor de laboratório, inicialização
 */

const SchApp = (() => {

  let activeLab = null;

  function getActiveLab() { return activeLab; }

  function setActiveLab(labId) {
    activeLab = labId;
    const lab = SchData.getLabById(labId);

    // Marca ativo na lista
    document.querySelectorAll('#schLabList li').forEach(li => {
      li.classList.toggle('active', li.dataset.labId === labId);
    });

    // Atualiza badge do painel
    const badge = document.getElementById('schLabBadge');
    if (badge) badge.textContent = '';

    // Reset painel de aulas
    document.getElementById('schSchedTitle').textContent = 'Selecione um dia no calendário';
    document.getElementById('schAulasContainer').innerHTML = emptyStateHTML();
    document.getElementById('schFormCard').style.display  = 'none';

    // Reset weekly
    document.getElementById('schWeekly').innerHTML = '<p class="sch-empty-week">Nenhuma reserva nesta semana.</p>';

    // Atualiza calendário com status do novo lab
    SchCalendar.resetSelected();
    SchCalendar.render();
  }

  function buildLabList() {
    const labs = SchData.getLabs();
    const ul   = document.getElementById('schLabList');
    ul.innerHTML = '';

    labs.forEach(lab => {
      const li = document.createElement('li');
      li.dataset.labId = lab.id;
      li.innerHTML = `<span class="sch-lab-icon">${lab.icone}</span> ${lab.nome}`;
      li.addEventListener('click', () => setActiveLab(lab.id));
      ul.appendChild(li);
    });

    // Seleciona o primeiro por padrão
    if (labs.length) setActiveLab(labs[0].id);
  }

  function emptyStateHTML() {
    return `
      <div class="sch-empty-state">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <rect x="3" y="4" width="18" height="18" rx="2.5"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
        </svg>
        <p>Clique em um dia disponível<br>para visualizar os horários</p>
      </div>`;
  }

  function init() {
    buildLabList();
    SchCalendar.init();
    SchForm.init();
  }

  document.addEventListener('DOMContentLoaded', init);

  return { getActiveLab, setActiveLab };

})();