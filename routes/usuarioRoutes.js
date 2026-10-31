const express = require("express");
const router = express.Router();

const {
  criarUsuario,
  loginUsuario,
  verificarSessao,
  logoutUsuario,
  solicitarRecuperacao,
  redefirnirSenha
} = require("../controllers/usuarioController");

router.post("/cadastro", criarUsuario);
router.post("/login", loginUsuario);
router.get("/me", verificarSessao);
router.post("/logout", logoutUsuario);
router.post("/recuperar-senha", solicitarRecuperacao);
router.post("/redefinir-senha", redefirnirSenha);

module.exports = router;
