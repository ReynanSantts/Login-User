const form = document.querySelector("#recuperar-form");
const feedback = document.querySelector("#feedback");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#email").value.trim();

  if (!email) {
    feedback.textContent = "Informe seu e-mail.";
    return;
  }

  const botao = form.querySelector('button[type="submit"]');

  botao.disabled = true;
  feedback.textContent = "Enviando link de recuperação...";

  try {
    const resposta = await fetch("/api/usuarios/recuperar-senha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      feedback.textContent =
        dados.erro || "Erro ao solicitar recuperação.";
      return;
    }

    feedback.textContent = dados.mensagem;
    form.reset();

  } catch (erro) {
    console.error("Erro na recuperação:", erro);

    feedback.textContent =
      "Não foi possível conectar ao servidor.";

  } finally {
    botao.disabled = false;
  }
});