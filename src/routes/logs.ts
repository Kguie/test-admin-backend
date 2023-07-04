/**
 *Définition de la route logs
 **/

import express from "express";

import auth from "../middlewares/auth";
const logCtrl = require("../controllers/logs");

const router = express.Router();

//Affiche toutes les connexions
router.get("/", auth, logCtrl.getAllLogs);

export default router;