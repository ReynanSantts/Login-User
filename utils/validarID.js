function validarId (id){
    if(!Number.isSafeInteger(id) || id <= 0 || id > 2147483647){
        return "ID inválido"
    }
}

module.exports = validarId