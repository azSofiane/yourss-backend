require("module-alias/register");
require("dotenv").config();
require("@config/config");

var path = require("path");

var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("@routes/index");

var inscriptionRouter = require("@routes/inscription");
var connexionRouter = require("@routes/connexion");
var reinisialisermdpRouter = require("@routes/reinisialisermdp");
var elevesRouter = require("@routes/eleves");
var professionnelsRouter = require("@routes/professionnels");
var annoncesRouter = require("@routes/annonces");

var app = express();

const cors = require("cors");
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true, // Permettre l'envoi des cookies lors des requêtes CORS (si besoin)
};

app.use(cors(corsOptions));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

app.use("/inscription", inscriptionRouter);
app.use("/connexion", connexionRouter);
app.use("/reinisialisermdp", reinisialisermdpRouter);
app.use("/eleves", elevesRouter);
app.use("/professionnels", professionnelsRouter);
app.use("/annonces", annoncesRouter);

module.exports = app;
