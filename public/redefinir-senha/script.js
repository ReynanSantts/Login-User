const form = document.querySelector("#redefinir-form");
const feedback = document.querySelector("#feedback");

const parametros = new URLSearchParams(window.location.search);
const token = parametros.get("token");

if (token) {
  window.history.replaceState({}, "", "/redefinir-senha/");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const senha = document.querySelector("#senha").value;
  const confirmarSenha = document.querySelector("#confirmarSenha").value;

  if (!token) {
    feedback.textContent = "Link de recuperação inválido";
    return;
  }

  if (senha !== confirmarSenha) {
    feedback.textContent = "As senhas não são iguais";
    return;
  }

  if (!senha || !confirmarSenha) {
    feedback.textContent = "Preencha as duas senhas.";
    return;
  }

  const botao = form.querySelector('button[type="submit"]');
  botao.disabled = true;
  feedback.textContent = "Redefinindo senha...";

  try {
    const resposta = await fetch("/api/usuarios/redefinir-senha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        senha,
        confirmarSenha,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      feedback.textContent = dados.erro || "Erro ao redefinir senha.";
      return;
    }

    feedback.textContent = "Senha redefinida com sucesso!";
    form.reset();
  } catch (erro) {
    console.error("Erro na redefinição:", erro);
    feedback.textContent = "Não foi possível conectar ao servidor.";
  } finally {
    botao.disabled = false;
  }
});
