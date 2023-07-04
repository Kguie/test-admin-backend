/**
 * Gestion de la logique métier des routes logs
 **/
import { Response, NextFunction } from 'express';

const Log = require("../models/log")
const User = require("../models/user")

/**
 * Affiche tous toutes les connections
 */
exports.getAllLogs = async (req: any, res: Response, next: NextFunction) => {
    const userID = req.auth.userId;
    //Recherche de la catégorie de l'utilisateur 
    try {
        const reqUser = await User.findById(userID);
        if (reqUser.category === 'superAdmin') {
            try {
                //Récupération des logs
                const logs = await Log.find()
                return res.status(200).json(logs)

            } catch (error) {
                return res.status(501).json({ error });
            }
        } else {
            res.status(403).json({ message: "Requête non autorisé" });
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
}