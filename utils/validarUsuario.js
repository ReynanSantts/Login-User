function validarCpf(cpf) {
  if (typeof cpf !== "string" || !/^\d{11}$/.test(cpf)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  const resto = soma % 11;
  const primeiroDigito = resto < 2 ? 0 : 11 - resto;

  if (primeiroDigito !== Number(cpf[9])) {
    return false;
  }

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  const resto2 = soma % 11;
  const segundoDigito = resto2 < 2 ? 0 : 11 - resto2;
  if (segundoDigito !== Number(cpf[10])) {
    return false;
  }

  return true;
}

function validarUsuario(usuario) {
  const erros = [];
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexCpf = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;
  const regexLetras = /(?:[a-zA-Z].*){2}/;
  const regexEspecial = /[^a-zA-Z0-9\s]/;

  if (!usuario || typeof usuario !== "object" || Array.isArray(usuario)) {
    return ["Os dados do usuário são inválidos"];
  }

  //Validação nome
  if (typeof usuario.nome !== "string") {
    erros.push("O nome deve ser um texto");
  } else if (usuario.nome.trim() === "") {
    erros.push("O nome é obrigatorio");
  } else if (usuario.nome.trim().length < 2) {
    erros.push("O nome deve conter pelo menos 2 caracteres");
  } else if (usuario.nome.trim().length > 100) {
    erros.push("O nome deve conter no máximo 100 caracteres");
  }

  //Validação email
  if (typeof usuario.email !== "string") {
    erros.push("O e-mail deve ser um texto");
  } else if (usuario.email.trim() === "") {
    erros.push("O e-mail é obrigatorio");
  } else if (usuario.email.trim().length > 150) {
    erros.push("O e-mail deve conter no máximo 150 caracteres");
  } else if (!regexEmail.test(usuario.email.trim())) {
    erros.push("O formato do e-mail é inválido");
  }

  //Validação cpf
  const cpfLimpo =
    typeof usuario.cpf === "string" ? usuario.cpf.replace(/\D/g, "") : "";

  if (typeof usuario.cpf !== "string") {
    erros.push("O CPF deve ser um texto");
  } else if (usuario.cpf.trim() === "") {
    erros.push("O CPF é obrigatório");
  } else if (!regexCpf.test(usuario.cpf.trim())) {
    erros.push("O CPF deve conter 11 dígitos, com ou sem a máscara padrão");
  } else if (cpfLimpo.length !== 11) {
    erros.push("O CPF deve conter exatamente 11 dígitos");
  } else if (!validarCpf(cpfLimpo)) {
    erros.push("O CPF informado é inválido");
  }

  //Validação Senha
  if (typeof usuario.senha !== "string") {
    erros.push("A senha deve ser um texto");
  } else if (usuario.senha.length === 0) {
    erros.push("A senha é obrigatória");
  } else if (usuario.senha.length < 8) {
    erros.push("A senha deve conter pelo menos 8 caracteres");
  } else if (!regexLetras.test(usuario.senha)) {
    erros.push("A senha deve conter pelo menos 2 letras");
  } else if (!regexEspecial.test(usuario.senha)) {
    erros.push("A senha deve conter pelo menos 1 caractere especial");
  }

  // Validação da confirmação de senha
  if (typeof usuario.confirmarSenha !== "string") {
    erros.push("A confirmação de senha deve ser um texto");
  } else if (usuario.confirmarSenha !== usuario.senha) {
    erros.push("As senhas não coincidem");
  }

  return erros;
}

module.exports = { validarCpf, validarUsuario };
