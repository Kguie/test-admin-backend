/**
 *Définition de la route customers
 **/

import express from "express";

import auth from "../middlewares/auth";
const customerCtrl = require("../controllers/customers");

const router = express.Router();

//Ajouter un client
router.post("/add-customer", auth, customerCtrl.addCustomer);

//Modifier un client
router.put("/:id", auth, customerCtrl.updateCustomer);

//Supprime un client
router.delete("/:id", auth, customerCtrl.deleteCustomer);

//Affiche le client dont on rentre l'id
router.get("/:id", auth, customerCtrl.getOneCustomer);

//Affiche le nom d'un client dont on rentre l'id
router.get("/name/:id", auth, customerCtrl.getOneCustomerFullName);

//Affiche tous les clients
router.get("/", auth, customerCtrl.getAllCustomers);

export default router;

