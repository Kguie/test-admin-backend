/**
 *Définition du schéma du modèle token pour la vérification par mail
 **/

//Import de mongoose pour utiliser les schémas
const mongooseToken = require('mongoose');

const tokenSchema = mongooseToken.Schema({
    userId: { type: String, required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now(), expires: 3600 },//1heure
})

//exportation
module.exports = mongooseToken.model("Token", tokenSchema);