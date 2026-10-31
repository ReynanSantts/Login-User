const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function conectar() {
  try {
    const conexao = await pool.connect();
    console.log("Conectado ao PostgreSQL!");
    conexao.release();
    return pool;
  } catch (erro) {
    console.error("Erro ao conectar:", erro.message);
    throw erro;
  }
}

module.exports = { conectar, pool };