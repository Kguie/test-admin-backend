/**
 * Gestion du middleware impliquant limiter
 **/

const rateLimit = require("express-rate-limit")

//Limite  le nombre de tentatives de login pour augmenter la sécurité contre les attaques par force
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15
    max: 5, // Limite chaque IP à 5 évènements de connexion par "fenêtre"
    message:
        "Trop d'échecs de connexion ont eu lieu depuis cet IP, veuillez réessayer dans 15 minutes",
    standardHeaders: true, // retourne les informations de x-rate-limit  dans le header de "RateLimit-*" 
    skipFailedRequests: false, //Ne prend pas en compte les tentatives réussies    
    skipSuccessfulRequests: true,//Prend en compte les échecs
})


export default loginLimiter;