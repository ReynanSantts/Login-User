const sql = require('mssql/msnodesqlv8')
require('dotenv').config()

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    driver: 'ODBC Driver 18 for SQL Server',
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
}

async function conectar() {
    try{
        const conexao = await sql.connect(config)
        console.log('Conectado ao SQL Server')
        return conexao
    }
    catch(erro){
        console.error('Erro ao conectar', erro.message)
        throw erro
    }
}

module.exports = {conectar, sql}