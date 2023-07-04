/**
 *Définition de la route orders
 **/
import express from "express";

import auth from "../middlewares/auth";
import multer from "../middlewares/multer-config";

const orderCtrl = require("../controllers/orders");

const router = express.Router();

//Enregistrement d'une nouvelle commande
router.post("/add-order", auth, orderCtrl.addOrder);

//Modifier une commande ,modifier une commande,exceptés le nom du client,les devis,les photos et le client
router.put("/:id", auth, orderCtrl.updateOrder);

//Modifier client de la commande
router.put("/:id/customer", auth, orderCtrl.updateOrdersCustomer);

//Ajouter un devis
router.put("/:id/add-quotation", auth, orderCtrl.addQuotation);

//Supprimer un devis
router.put("/:id/delete-quotation", auth, orderCtrl.deleteQuotation);

//Valider un devis
router.put("/:id/valid-quotation", auth, orderCtrl.validQuotation);

//Ajouter ou supprimer une photo
router.put("/:id/photos", auth, multer, orderCtrl.orderPhotosManager);

//Supprime commande
router.delete("/:id", auth, orderCtrl.deleteOrder);

//Affiche une commande dont on rentre l'id
router.get("/:id", auth, orderCtrl.getOneOrder);

//Affiche une toutes les commandes du client dont on rentre l'id
router.get("/customer/:id", auth, orderCtrl.getAllCustomerOrders);

//Affiche toutes les commandes
router.get("/", auth, orderCtrl.getAllOrders);

export default router;;

