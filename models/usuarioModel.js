const { sql, conectar } = require("../config/database");

async function cadastrarUsuario(nome, cpf, email, senha_hash) {
  try {
    const resultado = await new sql.Request()
      .input("nome", sql.VarChar(100), nome)
      .input("cpf", sql.Char(11), cpf)
      .input("email", sql.VarChar(150), email)
      .input("senha_hash", sql.VarChar(255), senha_hash)
      .query(
        "INSERT INTO Usuarios (nome,cpf,email,senha_hash) OUTPUT INSERTED.id, INSERTED.nome, INSERTED.email VALUES (@nome,@cpf,@email,@senha_hash)",
      );

    return resultado.recordset[0];
  } catch (erro) {
    console.error("Erro ao cadastrar Usuario:", erro.message);
    throw erro;
  }
}

async function listarUsuario() {
  try {
    const resultado = await new sql.Request().query(
      "SELECT id,nome FROM Usuarios",
    );

    return resultado.recordset;
  } catch (erro) {
    console.error("Erro ao listar Usuarios", erro.message);
    throw erro;
  }
}

async function buscarUsuarioPorId(id) {
  try {
    const resultado = await new sql.Request()
      .input("id", sql.Int, id)
      .query("select id,nome,email from Usuarios where id = @id");

    return resultado.recordset[0];
  } catch (erro) {
    console.error("Erro ao buscar Usuario por ID", erro.message);
    throw erro;
  }
}

async function buscarUsuarioPorEmail(email) {
  try {
    const resultado = await new sql.Request()
      .input("email", sql.VarChar(150), email)
      .query(
        "select id,nome,email,senha_hash from Usuarios where email = @email",
      );

    return resultado.recordset[0];
  } catch (erro) {
    console.error("Erro ao buscar Usuario por Email", erro.message);
    throw erro;
  }
}

async function verificarEmailExistente(email) {
  try {
    const resultado = await new sql.Request()
      .input("email", sql.VarChar(150), email.trim())
      .query("SELECT id FROM Usuarios WHERE email = @email");

    return resultado.recordset.length > 0;
  } catch (erro) {
    console.error("Erro ao verificar e-mail:", erro.message);
    throw erro;
  }
}

async function verificarCpfExistente(cpf) {
  try {
    const resultado = await new sql.Request()
      .input("cpf", sql.Char(11), cpf.trim())
      .query("SELECT id FROM Usuarios WHERE cpf = @cpf");

    return resultado.recordset.length > 0;
  } catch (erro) {
    console.error("Erro ao verificar CPF:", erro.message);
    throw erro;
  }
}

async function salvarTokenRecuperacao(usuarioId, tokenHash, expiraEm) {
  try {
    const resultado = await new sql.Request()
      .input("usuarioId", sql.Int, usuarioId)
      .input("tokenHash", sql.Char(64), tokenHash)
      .input("expiraEm", sql.DateTime2, expiraEm).query(`
                INSERT INTO RecuperacaoSenha
                    (usuario_id, token_hash, expira_em)
                VALUES
                    (@usuarioId, @tokenHash, @expiraEm)
            `);

    return resultado.rowsAffected[0];
  } catch (erro) {
    console.error("Erro ao salvar token:", erro.message);
    throw erro;
  }
}

async function buscarTokenRecuperacao(tokenHash) {
  try {
    const resultado = await new sql.Request().input(
      "tokenHash",
      sql.Char(64),
      tokenHash,
    ).query(`
        SELECT id, usuario_id, expira_em
        FROM RecuperacaoSenha
        WHERE token_hash = @tokenHash
          AND utilizado = 0
          AND expira_em > SYSUTCDATETIME()
      `);

    return resultado.recordset[0];
  } catch (erro) {
    console.error("Erro ao buscar token:", erro.message);
    throw erro;
  }
}

async function atualizarSenhaPorToken(tokenHash, novaSenhaHash) {
  try {
    const resultado = await new sql.Request()
      .input("tokenHash", sql.Char(64), tokenHash)
      .input("novaSenhaHash", sql.VarChar(255), novaSenhaHash).query(`
       SET XACT_ABORT ON

       BEGIN TRANSACTION

       DECLARE @usuarioId INT

       SELECT @usuarioId = usuario_id
       FROM RecuperacaoSenha WITH (UPDLOCK, HOLDLOCK)
       WHERE token_hash = @tokenHash
       AND utilizado = 0
       AND expira_em > SYSUTCDATETIME()

      IF @usuarioId IS NULL
      BEGIN
      ROLLBACK TRANSACTION
      SELECT CAST(0 AS BIT) AS sucesso
      END
      ELSE
      BEGIN
      UPDATE Usuarios
      SET senha_hash = @novaSenhaHash
      WHERE id = @usuarioId

      UPDATE RecuperacaoSenha
      set utilizado = 1
      WHERE usuario_id = @usuarioId
      AND utilizado = 0

      COMMIT TRANSACTION

      SELECT CAST(1 AS BIT) AS sucesso
      END
      `);

    return resultado.recordset[0].sucesso === true;
  } catch (erro) {
    console.error("Erro ao atualizar senha:", erro.message);
    throw erro;
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
