const { conectar } = require("./config/database");
const express = require("express");
const session = require("express-session");
const usuarioRoutes = require("./routes/usuarioRoutes");
const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  session({
    name: "teclog.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60,
    },
  }),
);


function protegerHome(req, res, next) {
  if (!req.session.usuarioId) {
    return res.redirect("/paglogin/");
  }

  next();
}

app.use("/paghome", protegerHome);

app.use(express.static("public"));

app.use("/api/usuarios", usuarioRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pagsobre", "index.html"));
});

app.get("/index.html", (req, res) => {
  res.redirect("/");
});

async function iniciarServer() {
  try {
    await conectar();

    console.log("Banco de dados pronto");

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (erro) {
    console.error("Falha ao iniciar:", erro.message);
  }
}

iniciarServer();
