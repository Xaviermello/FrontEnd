const btn = document.getElementById("registerBtn");
const errorBox = document.getElementById("registerError");

btn.addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const role = document.getElementById("role").value;

  let errors = [];

  // Nome
  if (!name) {
    errors.push("Nome é obrigatório");
  }

  // Email seguro (regex mais forte)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!email) {
    errors.push("Email é obrigatório");
  } else if (!emailRegex.test(email)) {
    errors.push("Email inválido");
  }

  // Senha forte
  const passwordRules = [
    { regex: /.{8,}/, msg: "mínimo 8 caracteres" },
    { regex: /[A-Z]/, msg: "uma letra maiúscula" },
    { regex: /[a-z]/, msg: "uma letra minúscula" },
    { regex: /[0-9]/, msg: "um número" },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, msg: "um caractere especial" }
  ];

  passwordRules.forEach(rule => {
    if (!rule.regex.test(password)) {
      errors.push("Senha precisa ter " + rule.msg);
    }
  });

  // Confirmar senha
  if (password !== confirmPassword) {
    errors.push("As senhas não coincidem");
  }

  // Role
  if (!role) {
    errors.push("Selecione um tipo de usuário");
  }

  // Mostrar erros
  if (errors.length > 0) {
    showError(errors.join("<br>"));
    return;
  }

  // Simulação envio seguro
  const userData = {
    name,
    email,
    password,
    confirmPassword,
    role
  };

  console.log("Enviando:", userData);

  alert("Cadastro realizado com sucesso!");
});

function showError(message) {
  errorBox.innerHTML = message;
  errorBox.classList.add("show");
}