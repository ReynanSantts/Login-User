
const form = document.querySelector("#signup-form");
const cpf = form.elements.cpf;
const feedback = document.querySelector(".feedback");

document.querySelector(".close").addEventListener("click", () => {
  window.location.href = "../pagsobre/";
});

cpf.addEventListener("input", () => {
  const digits = cpf.value.replace(/\D/g, "").slice(0, 11);

  cpf.value = digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = form.elements.name.value.trim();
  const cpfLimpo = cpf.value.replace(/\D/g, "");
  const email = form.elements.email.value.trim();
  const senha = form.elements.password.value;
  const confirmarSenha = form.elements.confirmPassword.value;

  if (!nome || !cpfLimpo || !email || !senha || !confirmarSenha) {
    feedback.textContent = "Preencha todos os campos.";
    return;
  }

  if (cpfLimpo.length !== 11) {
    feedback.textContent = "O CPF deve conter 11 dígitos.";
    return;
  }

  if (senha !== confirmarSenha) {
    feedback.textContent = "As senhas precisam ser iguais.";
    return;
  }

  const botao = form.querySelector('button[type="submit"]');

  botao.disabled = true;
  feedback.textContent = "Realizando cadastro...";

  try {
    const resposta = await fetch("/api/usuarios/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        cpf: cpfLimpo,
        email,
        senha,
        confirmarSenha
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      if (Array.isArray(dados.erros) && dados.erros.length > 0) {
        feedback.textContent = dados.erros.join(" | ");
      } else {
        feedback.textContent =
          dados.erro || dados.mensagem || "Erro ao cadastrar usuário.";
      }
      return;
    }

    feedback.textContent = "Cadastro realizado com sucesso!";
    form.reset();

    window.location.href = "../paglogin/";

  } catch (erro) {
    console.error("Erro ao cadastrar:", erro);
    feedback.textContent = "Não foi possível conectar ao servidor.";

  } finally {
    botao.disabled = false;
  }
});
