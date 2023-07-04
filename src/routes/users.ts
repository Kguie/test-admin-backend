/**
 *Définition de la route users
 **/

import express from 'express';

import auth from '../middlewares/auth';
import loginLimiter from '../middlewares/limiter';
const userCtrl = require("../controllers/users");

const router = express.Router();

//Ajout d'un nouvel utilisateur
router.post("/add-user", auth, userCtrl.addUser);

//Ajout du premier utilisateur
router.post("/signup", userCtrl.signup);

//Connexion de l'utilisateur
router.post("/login", loginLimiter, userCtrl.login,);

//Renvoie un lien pour redéfinir le mot de passe
router.post("/reset-password/", userCtrl.resetPasswordUser);

//Définition du nouveau mot de passe
router.put("/update-password/:id/:token", userCtrl.updatePasswordUser);

//Modifier utilisateur
router.put("/:id", auth, userCtrl.updateUser);

//Modifier la catégorie d'un utilisateur
router.put("/category/:id", auth, userCtrl.updateCategoryUser);

//Supprime utilisateur
router.delete("/:id", auth, userCtrl.deleteUser);

//Confirme la vérification du compte
router.get("/verify/:id/:token", userCtrl.verifyUser);

//Vérifie si un utilisateur a déjà été créé
router.get("/first-user", userCtrl.firstUser)

//Affiche l'utilisateur dont on rentre l'id
router.get("/:id", auth, userCtrl.getOneUser);

//Affiche le nom d'un utilisateur dont on rentre l'id
router.get("/name/:id", auth, userCtrl.getOneUserFullName);

//Affiche toutes les utilisateurs
router.get("/", auth, userCtrl.getAllUsers);

export default router;

