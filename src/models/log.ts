/**
 *Définition du schéma du modèle log, permet de garder une trace de ceux qui se sont connectés
 **/

//Import de mongoose pour utiliser les schémas
const mongooseLog = require('mongoose');

const logSchema = mongooseLog.Schema({
    userId: { type: String, required: true },
    userIp: { type: String, required: true },
    createdAt: { type: Date, required: true, expires: "260000m" }, // Expire après 6 mois (en minutes)
})

//exportation
module.exports = mongooseLog.model("Log", logSchema);