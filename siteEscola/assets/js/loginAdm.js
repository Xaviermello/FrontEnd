/**
 * CEEP — assets/js/login.js
 * Lógica da página de login
 */

(function () {

  /* ---- CHAVES ---- */
  const KEYS = {
    users:   'ceep_users',
    session: 'ceep_session'
  };

  /* ---- DADOS PADRÃO ---- */
  function initUsers() {
    if (!localStorage.getItem(KEYS.users)) {
      localStorage.setItem(KEYS.users, JSON.stringify([
        { id: 'u_admin', username: 'admin',     password: btoa('admin123'), nome: 'Administrador',  role: 'admin'     },
        { id: 'u_demo',  username: 'professor', password: btoa('prof123'),  nome: 'Professor Demo', role: 'professor' }
      ]));
    }
  }

  function getUsers() {
    try   { return JSON.parse(localStorage.getItem(KEYS.users)) || []; }
    catch { return []; }
  }

  function saveSession(user) {
    sessionStorage.setItem(KEYS.session, JSON.stringify({
      id: user.id, nome: user.nome, role: user.role, username: user.username
    }));
  }

  function getSession() {
    try   { return JSON.parse(sessionStorage.getItem(KEYS.session)) || null; }
    catch { return null; }
  }

  /* ---- UI HELPERS ---- */
  function showError(msg) {
    const el = document.getElementById('loginError');
    document.getElementById('loginErrorMsg').textContent = msg;
    el.classList.remove('show');
    void el.offsetWidth; // força reflow para reiniciar animação
    el.classList.add('show');
    document.getElementById('loginUser').classList.add('error');
    document.getElementById('loginPass').classList.add('error');
  }

  function clearError() {
    document.getElementById('loginError').classList.remove('show');
    document.getElementById('loginUser').classList.remove('error');
    document.getElementById('loginPass').classList.remove('error');
  }

  /* ---- LOGIN ---- */
  function doLogin() {
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value;
    const btn      = document.getElementById('loginBtn');

    clearError();

    if (!username || !password) {
      showError('Preencha o usuário e a senha.');
      return;
    }

    // Estado de carregamento
    btn.classList.add('loading');

    // Delay mínimo para UX
    setTimeout(function () {
      const users = getUsers();
      const user  = users.find(function (u) {
        return u.username.toLowerCase() === username.toLowerCase();
      });

      if (!user || atob(user.password) !== password) {
        btn.classList.remove('loading');
        showError('Usuário ou senha incorretos.');
        document.getElementById('loginPass').value = '';
        document.getElementById('loginPass').focus();
        return;
      }

      saveSession(user);

      // Redireciona conforme perfil
      window.location.href = user.role === 'admin' ? 'admin.html' : 'schedule.html';
    }, 600);
  }

  /* ---- TOGGLE SENHA ---- */
  function togglePassword() {
    var input = document.getElementById('loginPass');
    var icon  = document.getElementById('toggleIcon');
    if (input.type === 'password') {
      input.type    = 'text';
      icon.className = 'fa fa-eye-slash';
    } else {
      input.type    = 'password';
      icon.className = 'fa fa-eye';
    }
  }

  /* ---- INIT ---- */
  document.addEventListener('DOMContentLoaded', function () {

    // Ano no rodapé
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Inicializa usuários padrão
    initUsers();

    // Se já tem sessão ativa, redireciona direto
    var session = getSession();
    if (session && session.id) {
      window.location.href = session.role === 'admin' ? 'admin.html' : 'schedule.html';
      return;
    }

    // Eventos
    document.getElementById('loginBtn').addEventListener('click', doLogin);

    document.getElementById('togglePass').addEventListener('click', togglePassword);

    document.getElementById('loginPass').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doLogin();
    });

    document.getElementById('loginUser').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('loginPass').focus();
    });

    document.getElementById('loginUser').addEventListener('input', clearError);
    document.getElementById('loginPass').addEventListener('input', clearError);
  });

})();