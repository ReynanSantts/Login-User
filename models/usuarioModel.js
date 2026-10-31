
const { pool } = require("../config/database");

// CADASTRAR USUÁRIO
async function cadastrarUsuario(nome, cpf, email, senha_hash) {
  try {
    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, cpf, email, senha_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email`,
      [nome, cpf, email, senha_hash]
    );

    return resultado.rows[0];
  } catch (erro) {
    console.error("Erro ao cadastrar Usuario:", erro.message);
    throw erro;
  }
}

// LISTAR USUÁRIOS
async function listarUsuario() {
  try {
    const resultado = await pool.query(
      "SELECT id, nome FROM usuarios"
    );

    return resultado.rows;
  } catch (erro) {
    console.error("Erro ao listar Usuarios:", erro.message);
    throw erro;
  }
}

// BUSCAR USUÁRIO POR ID
async function buscarUsuarioPorId(id) {
  try {
    const resultado = await pool.query(
      "SELECT id, nome, email FROM usuarios WHERE id = $1",
      [id]
    );

    return resultado.rows[0];
  } catch (erro) {
    console.error("Erro ao buscar Usuario por ID:", erro.message);
    throw erro;
  }
}

// BUSCAR USUÁRIO POR E-MAIL
async function buscarUsuarioPorEmail(email) {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, email, senha_hash
       FROM usuarios
       WHERE email = $1`,
      [email]
    );

    return resultado.rows[0];
  } catch (erro) {
    console.error("Erro ao buscar Usuario por Email:", erro.message);
    throw erro;
  }
}

// VERIFICAR E-MAIL EXISTENTE
async function verificarEmailExistente(email) {
  try {
    const resultado = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email.trim()]
    );

    return resultado.rows.length > 0;
  } catch (erro) {
    console.error("Erro ao verificar e-mail:", erro.message);
    throw erro;
  }
}

// VERIFICAR CPF EXISTENTE
async function verificarCpfExistente(cpf) {
  try {
    const resultado = await pool.query(
      "SELECT id FROM usuarios WHERE cpf = $1",
      [cpf.trim()]
    );

    return resultado.rows.length > 0;
  } catch (erro) {
    console.error("Erro ao verificar CPF:", erro.message);
    throw erro;
  }
}

// SALVAR TOKEN DE RECUPERAÇÃO
async function salvarTokenRecuperacao(usuarioId, tokenHash, expiraEm) {
  try {
    const resultado = await pool.query(
      `INSERT INTO recuperacaosenha
       (usuario_id, token_hash, expira_em)
       VALUES ($1, $2, $3)`,
      [usuarioId, tokenHash, expiraEm]
    );

    return resultado.rowCount;
  } catch (erro) {
    console.error("Erro ao salvar token:", erro.message);
    throw erro;
  }
}

// BUSCAR TOKEN DE RECUPERAÇÃO
async function buscarTokenRecuperacao(tokenHash) {
  try {
    const resultado = await pool.query(
      `SELECT id, usuario_id, expira_em
       FROM recuperacaosenha
       WHERE token_hash = $1
         AND utilizado = FALSE
         AND expira_em > NOW()`,
      [tokenHash]
    );

    return resultado.rows[0];
  } catch (erro) {
    console.error("Erro ao buscar token:", erro.message);
    throw erro;
  }
}

// ATUALIZAR SENHA UTILIZANDO TOKEN
async function atualizarSenhaPorToken(tokenHash, novaSenhaHash) {
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    const resultadoToken = await cliente.query(
      `SELECT usuario_id
       FROM recuperacaosenha
       WHERE token_hash = $1
         AND utilizado = FALSE
         AND expira_em > NOW()
       FOR UPDATE`,
      [tokenHash]
    );

    if (resultadoToken.rows.length === 0) {
      await cliente.query("ROLLBACK");
      return false;
    }

    const usuarioId = resultadoToken.rows[0].usuario_id;

    const resultadoSenha = await cliente.query(
      `UPDATE usuarios
       SET senha_hash = $1
       WHERE id = $2`,
      [novaSenhaHash, usuarioId]
    );

    if (resultadoSenha.rowCount !== 1) {
      await cliente.query("ROLLBACK");
      return false;
    }

    await cliente.query(
      `UPDATE recuperacaosenha
       SET utilizado = TRUE
       WHERE usuario_id = $1
         AND utilizado = FALSE`,
      [usuarioId]
    );

    await cliente.query("COMMIT");

    return true;
  } catch (erro) {
    try {
      await cliente.query("ROLLBACK");
    } catch (erroRollback) {
      console.error("Erro ao reverter transação:", erroRollback.message);
    }

    console.error("Erro ao atualizar senha:", erro.message);
    throw erro;
  } finally {
    cliente.release();
  }
}

module.exports = {
  listarUsuario,
  buscarUsuarioPorId,
  buscarUsuarioPorEmail,
  cadastrarUsuario,
  verificarEmailExistente,
  verificarCpfExistente,
  salvarTokenRecuperacao,
  buscarTokenRecuperacao,
  atualizarSenhaPorToken
};
