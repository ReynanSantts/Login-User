
const menuButton = document.querySelector(".menu-button");
const userMenu = document.querySelector("#user-menu");

menuButton.addEventListener("click", () => {
  const willOpen = userMenu.hidden;
  userMenu.hidden = !willOpen;
  menuButton.setAttribute("aria-expanded", String(willOpen));
});

document.addEventListener("click", (event) => {
  if (!userMenu.contains(event.target) && !menuButton.contains(event.target)) {
    userMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
  }
});

async function carregarUsuario() {
  try {
    const resposta = await fetch("/api/usuarios/me", {
      method: "GET",
      credentials: "same-origin"
    });

    if (resposta.status === 401) {
      window.location.replace("../paglogin/");
      return;
    }

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || "Erro ao carregar usuário.");
    }

    const usuario = dados.usuario;

    const primeiroNome = usuario.nome.trim().split(/\s+/)[0];

    document.querySelector("#nome-header").textContent = usuario.nome;
    document.querySelector("#nome-boas-vindas").textContent = primeiroNome;
    document.querySelector("#nome-usuario").textContent = usuario.nome;
    document.querySelector("#email-usuario").textContent = usuario.email;
    document.querySelector("#status-usuario").textContent = "Autenticado";

  } catch (erro) {
    console.error("Erro ao carregar usuário:", erro);
    document.querySelector("#status-usuario").textContent =
      "Erro ao verificar sessão";
  }
}

carregarUsuario();

document.querySelector(".logout").addEventListener("click", async () => {
  try {
    const resposta = await fetch("/api/usuarios/logout", {
      method: "POST",
      credentials: "same-origin"
    });

    if (!resposta.ok) {
      throw new Error("Erro ao encerrar sessão.");
    }

    window.location.replace("../paglogin/");

  } catch (erro) {
    console.error("Erro ao sair:", erro);
    alert("Não foi possível encerrar sua sessão.");
  }
});
