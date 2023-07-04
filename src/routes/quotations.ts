/**
 *Définition de la route Quotations
 **/
import express from "express";

import auth from "../middlewares/auth";
const quotationCtrl = require("../controllers/quotations");

const router = express.Router();

//Affiche un devis dont on rentre l'id
router.get("/:id", auth, quotationCtrl.getOneQuotation);

//Affiche tous les devis liés à une commande
router.get("/order/:id", auth, quotationCtrl.getAllQuotations);

export default router;;