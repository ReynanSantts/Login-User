
const form = document.querySelector("#login-form");
const feedback = document.querySelector(".feedback");

document.querySelector(".close").addEventListener("click", () => {
  window.location.href = "../pagsobre/";
});

document.querySelector(".forgot").addEventListener("click", () => {
  window.location.href = "../recuperar-senha/";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = form.querySelector('[name="email"]').value.trim();
  const senha = form.querySelector('[name="password"]').value;

  if (!email || !senha) {
    feedback.textContent = "Preencha o e-mail e a senha.";
    return;
  }

  const botao = form.querySelector('button[type="submit"]');

  botao.disabled = true;
  feedback.textContent = "Entrando...";

  try {
    const resposta = await fetch("/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        email,
        senha
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      feedback.textContent = dados.erro || "E-mail ou senha incorretos.";
      return;
    }

    feedback.textContent = "Login realizado com sucesso!";

    window.location.href = "../paghome/";

  } catch (erro) {
    console.error("Erro ao realizar login:", erro);
    feedback.textContent = "Não foi possível conectar ao servidor.";

  } finally {
    botao.disabled = false;
  }
});
