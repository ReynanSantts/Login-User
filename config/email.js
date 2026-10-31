require("dotenv").config();

async function enviarEmail({ to, subject, text }) {
  const resposta = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: {
        name: "TecLog",
        email: process.env.EMAIL_USER
      },
      to: [{ email: to }],
      subject,
      textContent: text
    })
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      resultado.message || "Erro ao enviar e-mail pelo Brevo"
    );
  }

  return resultado;
}

module.exports = { enviarEmail };