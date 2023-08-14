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
  origin: ['*'], // changer * par les urls du frontend une fois déployé, séparé par des virgule possible aussi d'ajouter sont ip
  credentials: true
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
