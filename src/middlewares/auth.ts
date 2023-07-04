/**
 * Gestion du middleware impliquant le token d'authentification
 **/
import { Response, NextFunction } from 'express';

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

//DOTENV setup
dotenv.config();

//Décode le token pour récupérer l'id de l'utilisateur
const auth = (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWB_TOKEN);
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();

    } catch (error) {
        return res.status(405).json({ error });
    }
};
export default auth;