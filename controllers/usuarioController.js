const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { enviarEmail } = require("../config/email");
const {
  listarUsuario,
  buscarUsuarioPorId,
  buscarUsuarioPorEmail,
  cadastrarUsuario,
  verificarEmailExistente,
  verificarCpfExistente,
  salvarTokenRecuperacao,
  buscarTokenRecuperacao,
  atualizarSenhaPorToken,
} = require("../models/usuarioModel");
const { validarUsuario } = require("../utils/validarUsuario");
const validarId = require("../utils/validarID");
const { json } = require("express");
const { error } = require("console");

async function buscarUsuario(req, res) {
  try {
    const usuario = await listarUsuario();

    return res.status(200).json(usuario);
  } catch (erro) {
    console.error("ERRO no Controller", erro.message);

    return res.status(500).json({
      mensagem: "ERRO interno ao buscar usuarios",
    });
  }
}

async function buscarUsuarioId(req, res) {
  try {
    const id = Number(req.params.id);

    const erroId = validarId(id);

    if (erroId) {
      return res.status(400).json({ erro: erroId });
    }

    const usuario = await buscarUsuarioPorId(id);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    return res.status(200).json(usuario);
  } catch (erro) {
    console.error("ERRO no Controller:", erro.message);

    return res.status(500).json({
      mensagem: "Erro interno ao buscar usuário por ID",
    });
  }
}

async function buscarUsuarioEmail(req, res) {
  try {
    const email = req.params.email;

    if (typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({
        erro: "E-mail inválido",
      });
    }

    const usuario = await buscarUsuarioPorEmail(email.trim().toLowerCase());

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    return res.status(200).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    });
  } catch (erro) {
    console.error("ERRO no Controller:", erro.message);

    return res.status(500).json({
      mensagem: "Erro interno ao buscar usuário por e-mail",
    });
  }
}

async function criarUsuario(req, res) {
  try {
    const usuario = req.body;

    const erros = validarUsuario(usuario);

    if (erros.length > 0) {
      return res.status(400).json({ erros });
    }

    const nome = usuario.nome.trim();
    const email = usuario.email.trim().toLowerCase();
    const cpf = usuario.cpf.replace(/\D/g, "");

    const emailExistente = await verificarEmailExistente(email);

    if (emailExistente) {
      return res.status(409).json({
        erro: "E-mail já cadastrado",
      });
    }

    const cpfExistente = await verificarCpfExistente(cpf);

    if (cpfExistente) {
      return res.status(409).json({
        erro: "CPF já cadastrado",
      });
    }

    const senha_hash = await bcrypt.hash(usuario.senha, 12);

    const novoUsuario = await cadastrarUsuario(nome, cpf, email, senha_hash);

    return res.status(201).json({
      mensagem: "Usuario cadastrado com sucesso",
      usuario: novoUsuario,
    });
  } catch (erro) {
    console.error("ERRO no Controller:", erro.message);

    if (erro.number === 2601 || erro.number === 2627) {
      return res.status(409).json({
        erro: "E-mail ou CPF já cadastrado",
      });
    }

    return res.status(500).json({
      mensagem: "Erro interno ao criar usuário",
    });
  }
}

async function loginUsuario(req, res) {
  try {
    const { email, senha } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !email.trim() ||
      !senha
    ) {
      return res.status(400).json({
        erro: "E-mail e senha sao obrigatorios",
      });
    }

    const usuario = await buscarUsuarioPorEmail(email.trim().toLowerCase());

    if (!usuario) {
      return res.status(401).json({
        erro: "E-mail incorreto ou senha incorretos",
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos",
      });
    }

    req.session.regenerate((erro) => {
      if (erro) {
        console.error("Erro ao criar sessão", erro.message);

        return res.status(500).json({
          erro: "Erro ai iniciar sessão",
        });
      }

      req.session.usuarioId = usuario.id;

      req.session.save((erro) => {
        if (erro) {
          console.error("Erro ao salvar sessão", erro.message);
          return res.status(500).json({
            erro: "Erro ao salvar sessão",
          });
        }

        return res.status(200).json({
          mensagem: "Login realizado com sucesso",
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
          },
        });
      });
    });
  } catch (erro) {
    console.error("Erro no login:", erro.message);

    return res.status(500).json({
      erro: "Erro interno ao realizar login",
    });
  }
}

async function verificarSessao(req, res) {
  try {
    if (!req.session.usuarioId) {
      return res.status(401).json({
        erro: "Usuário não autenticado",
      });
    }

    const usuario = await buscarUsuarioPorId(req.session.usuarioId);

    if (!usuario) {
      return res.status(401).json({
        erro: "Usuário não encontrado",
      });
    }

    return res.status(200).json({
      mensagem: "Usuário autenticado",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (erro) {
    console.error("Erro ao verificar sessão:", erro.message);

    return res.status(500).json({
      erro: "Erro interno ao verificar sessão",
    });
  }
}

async function logoutUsuario(req, res) {
  if (!req.session.usuarioId) {
    return res.status(401).json({
      erro: "Usuario não autenticado",
    });
  }

  req.session.destroy((erro) => {
    if (erro) {
      console.error("Erro ao encerrar sessão", erro.message);

      return res.status(500).json({
        erro: "Erro ao realizar logout",
      });
    }

    res.clearCookie("teclog.sid");

    return res.status(200).json({
      mensagem: "Logout realizado com sucesso",
    });
  });
}

async function solicitarRecuperacao(req, res) {
  try {
    const { email } = req.body || {};

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        erro: "Informe um e-mail valido",
      });
    }

    const usuario = await buscarUsuarioPorEmail(email.trim().toLowerCase());

    const mensagem = {
      mensagem:
        "Se o e-email estiver cadastrado, você receberá um link de recuperação",
    };

    if (!usuario) {
      return res.status(200).json(mensagem);
    }

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const expiraEm = new Date(Date.now() + 15 * 60 * 1000);

    await salvarTokenRecuperacao(usuario.id, tokenHash, expiraEm);

    const baseUrl = (process.env.APP_URL || "http://localhost:3000").replace(
      /\/$/,
      "",
    );

    const link = `${baseUrl}/redefinir-senha/?token=${token}`;

    await enviarEmail({
      to: usuario.email,
      subject: "Recuperação de senha - TecLog",
      text: `Olá! Para redefinir sua senha, acesse o link abaixo:

${link}

Este link expira em 15 minutos.

Se você não solicitou a recuperação, ignore este e-mail.`,
    });

    return res.status(200).json(mensagem);
  } catch (erro) {
    console.error("Erro na recuperação:", erro.message);

    return res.status(500).json({
      erro: "Não foi possível processar a recuperação",
    });
  }
}

async function redefirnirSenha(req, res) {
  try {
    const { token, senha, confirmarSenha } = req.body || {};

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/.test(token) ||
      typeof senha !== "string" ||
      typeof confirmarSenha !== "string"
    ) {
      return res.status(400).json({
        erro: "Dados inválidos",
      });
    }

    if (senha !== confirmarSenha) {
      return res.status(400).json({
        erro: "As senha não são iguais",
      });
    }

    if (
      senha.length < 8 ||
      (senha.match(/[a-zA-Z]/g) || []).length < 2 ||
      !/[^a-zA-Z0-9]/.test(senha)
    ) {
      return res.status(400).json({
        erro: "A senha precisa ter pelo menos 8 caracteres, 2 letras e 1 caractere especial",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const recupercao = await buscarTokenRecuperacao(tokenHash);

    if (!recupercao) {
      return res.status(400).json({
        erro: "Token inválido, expirado ou já utilizado",
      });
    }

    const novaSenhaHash = await bcrypt.hash(senha, 12);
    const atualizado = atualizarSenhaPorToken(tokenHash, novaSenhaHash);

    if (!atualizado) {
      return res.status(400).json({
        erro: "Token inválido, expirado ou já utilizado",
      });
    }

    return res.status(200).json({
      mensagem: "Senha redefinida com sucesso",
    });
  } catch (erro) {
    console.error("Erro ao redefinir senha:", erro.message);

    return res.status(500).json({
      erro: "Erro interno ao redefinir senha",
    });
  }
}

module.exports = {
  buscarUsuario,
  buscarUsuarioId,
  buscarUsuarioEmail,
  criarUsuario,
  loginUsuario,
  verificarSessao,
  logoutUsuario,
  solicitarRecuperacao,
  redefirnirSenha,
};
