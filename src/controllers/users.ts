/**
 * Gestion de la logique métier des routes de user
 **/
import { Response, NextFunction } from 'express';

import { sendEmail } from '../../public/utils/sendEmail';

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const randomBytes = require('randombytes');
const requestIP = require('request-ip');

const Log = require("../models/log")
const User = require("../models/user");
const Token = require("../models/token");

//DOTENV setup
dotenv.config();

/*Enregistrement d'un nouvel utilisateur par un admin */
/*Enregistrement des nouveaux utilisateurs */
exports.addUser = async (req: any, res: Response, next: NextFunction) => {
    const userObject = { ...req.body };
    const userID = req.auth.userId;

    //Suppression des données non nécessaire par sécurité
    delete userObject._id;
    delete userObject.data;
    delete userObject.category;
    delete userObject.lastConnect;

    //Vérification de la catégorie de l'auteur de la requête
    try {
        const reqUser = await User.findById(userID)
        if (reqUser.category === "superAdmin" || reqUser.category === "admin") {

            //Vérification de l'email du nouvel utilisateur
            try {
                const newUser = await User.findOne({ "email": userObject.email })

                //L'utilisateur est a déjà créé un compte
                if (newUser) {
                    const url = process.env.URL_FRONT
                    const text = `Bonjour ${newUser.name.firstName} 😁                
                    \n\nQuelqu'un vient d'essayer de créer un compte en utilisant votre adresse: ${newUser.email}.
                    \n\Vous pouvez utiliser le lien ci-dessous pour vous connecter ou demander la réinitialisation de votre mot de passe:
                    ${url}
                    \n\nBonne journée à vous
                    Test-admin                     
                    `
                    await sendEmail(newUser.email, "Création de compte", text)
                    return res.status(202).json({ message: "Un email vous a été envoyé, votre compte sera activé dès la vérification effectuée" })
                } else {
                    //Hash du mdp rentré par l'utilisateur
                    const hashKey: any = process.env.SALT && parseInt(process.env.SALT)
                    try {
                        const hash = await bcrypt.hash(userObject.password, hashKey)
                        const user = new User({
                            name: {
                                firstName: userObject.firstName,
                                lastName: userObject.lastName
                            },
                            email: userObject.email,
                            password: hash,
                            data: {
                                joinDate: Date.now()
                            },
                            verified: false,
                            category: 'user'
                        });
                        try {
                            await user.save()
                            //Envoi du mail de vérification
                            try {
                                //Vérification du mail de l'utilisateur nécessaire à l'utilisation de son compte
                                const token = await new Token({
                                    userId: user.id,
                                    token: randomBytes(30).toString('hex')
                                })
                                const url = `${process.env.URL_FRONT}/verify/${user.id}/${token.token}`
                                const text = `Bonjour ${user.name.firstName} 😁                
                                \n\nUn compte vient d'être créer en utilisant votre adresse: ${user.email}.
                                \n\Vous pouvez utiliser le lien ci-dessous pour vous valider la création de ce compte et confirmer votre adresse:
                                ${url}
                                \nVotre mot de passe vous a été envoyé par téléphone, pensez à le réinitialiser une fois la vérification effectuée.
                                \n\nBonne journée à vous
                                Test-admin                     
                                `
                                await sendEmail(user.email, "Email de vérification", text)
                                await token.save()
                                return res.status(201).json({ message: "Un email vous a été envoyé, votre compte sera activé dès la vérification effectuée" })

                            } catch (error) {
                                return res.status(504).json({ error })
                            }
                        } catch (error) {
                            return res.status(503).json({ error })
                        }
                    } catch (error) {
                        return res.status(502).json({ error })
                    }

                }
            } catch (error) {
                return res.status(501).json({ error })
            }

        } else {
            return res.status(403).json({ message: "Requête non autorisé" });
        }
    } catch (error) {
        return res.status(500).json({ error })
    }
}

/*Enregistrement du premier utilisateur) */
exports.signup = async (req: any, res: Response, next: NextFunction) => {
    const userObject = { ...req.body };

    delete userObject._id;
    delete userObject.data;
    delete userObject.category;
    delete userObject.lastConnect;

    //Vérification qu'aucun utilisateur n'est enregistré dans la base de données
    try {
        const users = await User.find()
        if (users && users.length > 0) {
            return res.status(403).json({ message: "Requête non autorisé" });

            //Aucun n'utilisateur n'est encore enregistré
        } else {
            //Hash du mdp rentré par l'utilisateur
            const hashKey: any = process.env.SALT && parseInt(process.env.SALT)
            try {
                const hash = await bcrypt.hash(userObject.password, hashKey)
                const user = new User({
                    name: {
                        firstName: userObject.firstName,
                        lastName: userObject.lastName
                    },
                    email: userObject.email,
                    password: hash,
                    data: {
                        joinDate: Date.now()
                    },
                    verified: false,
                    category: 'superAdmin'
                });
                try {
                    await user.save()
                    //Envoi du mail de vérification
                    try {
                        //Vérification du mail de l'utilisateur nécessaire à l'utilisation de son compte
                        const token = await new Token({
                            userId: user.id,
                            token: randomBytes(30).toString('hex')
                        })
                        const url = `${process.env.URL_FRONT}/verify/${user.id}/${token.token}`
                        const text = `Bonjour ${user.name.firstName} 😁                
                    \n\nUn compte vient d'être créer en utilisant votre adresse: ${user.email}.
                    \n\Vous pouvez utiliser le lien ci-dessous pour vous valider la création de ce compte et confirmer votre adresse:
                    ${url}
                    \n\nBonne journée à vous
                    Test-admin                     
                    `
                        await sendEmail(user.email, "Email de vérification", text)
                        await token.save()
                        return res.status(201).json({ message: "Un email vous a été envoyé, votre compte sera activé dès la vérification effectuée" })

                    } catch (error) {
                        return res.status(503).json({ error })
                    }
                } catch (error) {
                    return res.status(502).json({ error })
                }
            } catch (error) {
                return res.status(501).json({ error })
            }
        }
    } catch (error) {
        return res.status(500).json({ error })
    }

};

/*Connexion des utilisateurs */
exports.login = async (req: any, res: Response, next: NextFunction) => {
    const userObject = { ...req.body };
    delete userObject.lastConnect;

    try {
        //Recherche de l'utilisateur auteur de la requête
        const reqUser = await User.findOne({ "email": userObject.email })

        if (!reqUser) {
            return res.status(401).json({ message: "Paire identifiant/mot de passe incorrecte" })
        }
        try {
            //Comparaison des mots de passe
            const passwordIsValid = await bcrypt.compare(userObject.password, reqUser.password)
            if (!passwordIsValid) {
                return res.status(401).json({ message: "Paire identifiant/mot de passe incorrecte" })
            }
            //Le compte de l'utilisateur n'a pas encore été vérifié,la connexion est bloquée
            if (reqUser.verified === false) {
                //Vérification du mail de l'utilisateur nécessaire à l'utilisation de son compte
                const token = await new Token({
                    userId: reqUser.id,
                    token: randomBytes(30).toString('hex')
                })
                const url = `${process.env.URL_FRONT}/verify/${reqUser.id}/${token.token}`
                const text = `Bonjour ${reqUser.name.firstName} 😁                
                \n\nVotre adresse ${reqUser.email} n'a pas encore été vérifiée.
                \n\Vous pouvez utiliser le lien ci-dessous pour vous valider la création de ce compte et confirmer votre adresse:
                ${url}
                \n\nBonne journée à vous
                Test-admin                     
                `
                await sendEmail(reqUser.email, "Email de vérification", text)
                await token.save()
                return res.status(201).json({ message: "Un email vous a été envoyé, votre compte sera activé dès la vérification effectuée" })
            }
            else {
                //Le mot de passe est valide
                try {
                    await User.updateOne({ _id: reqUser.id }, {
                        lastConnect: Date.now()
                    })
                    //Enregistrement de la connexion dans le log
                    const ipAddress = requestIP.getClientIp(req);
                    const log = await new Log({
                        userId: reqUser.id,
                        userIp: ipAddress,
                        createdAt: Date.now()
                    })
                    await log.save()
                    return res.status(200).json({
                        //Réponse avec envoi de l'id de l'utilisateur ainsi que du token
                        userId: reqUser.id,
                        token: jwt.sign(
                            { userId: reqUser.id },
                            process.env.JWB_TOKEN,
                            { expiresIn: "5h" }
                        )
                    })
                } catch (error) {
                    return res.status(502).json({ error })
                }
            }
        } catch (error) {
            return res.status(501).json({ error })
        }
    } catch (error) {
        return res.status(500).json({ error })
    }
};

/*Récupérer le lien pour modifier un mot de passe*/
exports.resetPasswordUser = async (req: any, res: Response, next: NextFunction) => {
    const userObject = { ...req.body };
    try {
        //Recherche de l'utilisateur auteur de la requête
        const reqUser = await User.findOne({ "email": userObject.email })
        //L'utilisateur n'est pas dans la base de données
        if (!reqUser) {
            return res.status(203).json({ message: "Un lien vient de vous être envoyé sur l'adresse mail indiqué afin de pouvoir changer votre mot de passe ,dans le cas où vous un compte a bien été créé avec adresse" })
        }
        //Le compte de l'utilisateur n'a pas encore été vérifié,la connexion est bloquée
        if (reqUser.verified === false) {
            //Vérification du mail de l'utilisateur nécessaire à l'utilisation de son compte
            const token = await new Token({
                userId: reqUser.id,
                token: randomBytes(30).toString('hex')
            })
            const url = `${process.env.URL_FRONT}/verify/${reqUser.id}/${token.token}`
            const text = `Bonjour ${reqUser.name.firstName} 😁                
            \n\nVotre adresse ${reqUser.email} n'a pas encore été vérifiée.
            \n\Vous pouvez utiliser le lien ci-dessous pour vous valider la création de ce compte et confirmer votre adresse:
            ${url}
            \n\nBonne journée à vous
            Test-admin                     
            `
            await sendEmail(reqUser.email, "Email de vérification", text)

            token.save()
            return res.status(201).json({ message: "Un email vous a été envoyé, votre compte sera activé dès la vérification effectuée" })
        }
        try {
            //Envoie du lien pour changer le mot de passe
            const token = await new Token({
                userId: reqUser.id,
                token: randomBytes(30).toString('hex')
            })
            const url = `${process.env.URL_FRONT}/update-password/${reqUser.id}/${token.token}`
            const text = `Bonjour ${reqUser.name.firstName} 😁                
            \n\nUne réinitialisation de votre mot de passe a été demandé.
            \n\Vous pouvez utiliser le lien ci-dessous pour définir votre nouveau mot de passe:
            ${url}
            \n\nBonne journée à vous
            Test-admin                     
            `
            await sendEmail(reqUser.email, "Demande de réinitialisation du mot de passe", text)
            await token.save()
            return res.status(201).json({
                message: "Un lien vient de vous être envoyé sur l'adresse mail indiqué afin de pouvoir changer votre mot de passe, dans le cas où vous un compte a bien été créé avec adresse"
            })
        }
        catch (error) {
            return res.status(501).json({ error })
        }
    }
    catch (error) {
        return res.status(500).json({ error })
    }
};

/*Mettre à jour le mot de passe*/
exports.updatePasswordUser = async (req: any, res: Response, next: NextFunction) => {
    const userObject = { ...req.body };
    const hashKey: any = process.env.SALT && parseInt(process.env.SALT)
    try {
        //Recherche de l'utilisateur dont on veut mettre à jour le mot de passe avec son id présent dans l'url
        const reqUser = await User.findById(req.params.id)
        if (!reqUser) {
            return res.status(400).json({ message: "Ce lien n'est pas valide ou est expiré" })
        }
        try {
            //Recherche du token entré dans l'url
            const token = await Token.findOne({
                userId: reqUser.id,
                token: req.params.token
            })
            if (!token) {
                return res.status(400).json({ message: "Ce lien n'est pas valide ou est expiré" })
            }
            try {
                //Entrée du nouveau mot de passe
                const newPassword = await bcrypt.hash(userObject.password, hashKey)
                await User.updateOne({ _id: reqUser.id }, {
                    password: newPassword,
                    $set: {
                        "data.update.userId": reqUser.id,
                        "data.update.time": Date.now()
                    }
                })
                await token.remove()
                return res.status(200).json({ message: "Mot de passe mis à jour!" })

            } catch (error) {
                return res.status(502).json({ error });
            }
        } catch (error) {
            return res.status(501).json({ error });
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
};



/*Modifier un utilisateur*/
exports.updateUser = async (req: any, res: Response, next: NextFunction) => {
    const userObject = { ...req.body };
    const userID = req.auth.userId;

    try {
        //Recherche de l'utilisateur auteur de la requête
        const reqUser = await User.findById(userID)
        if (userID === req.params.id || reqUser.category === 'superAdmin') {
            //Effacement des catégories qui ne doivent pas être modifiées ou qui le sont de manière automatique par sécurité
            delete userObject._id;
            delete userObject.data;
            delete userObject.lastConnect;
            delete userObject.category;
            delete userObject.password;

            //Recherche de l'utilisateur dont les données vont être mises à jour pour voir si son compte est vérifié
            try {
                const updatedUser = await User.findById(req.params.id)
                if (updatedUser.verified === false) {
                    //Ajout de la fonction de vérification du mail
                    try {
                        const token = await new Token({
                            userId: updatedUser.id,
                            token: randomBytes(30).toString('hex')
                        })
                        const url = `${process.env.URL_FRONT}/verify/${updatedUser.id}/${token.token}`
                        const text = `Bonjour ${updatedUser.name.firstName} 😁                
                    \n\nVotre adresse ${updatedUser.email} n'a pas encore été vérifiée.
                    \n\Vous pouvez utiliser le lien ci-dessous pour vous valider la création de ce compte et confirmer votre adresse:
                    ${url}
                    \n\nBonne journée à vous
                    Test-admin                     
                    `
                        await sendEmail(updatedUser.email, "Email de vérification", text)
                        await token.save()
                        return res.status(201).json({ message: "Un email vous a été envoyé, votre compte sera activé dès la vérification effectuée" })
                    } catch (error) {
                        return res.status(502).json({ error });
                    }
                } else {
                    try {
                        //Met à jour l'utilisateur
                        await User.updateOne({ _id: req.params.id }, {
                            ...userObject,
                            $set: {
                                "data.update.userId": reqUser.id,
                                "data.update.time": Date.now()
                            }
                        })
                        return res.status(200).json({ message: "Utilisateur mis à jour!" })
                    } catch (error) {
                        return res.status(503).json({ error });
                    }
                }
            } catch (error) {
                return res.status(501).json({ error });
            }
        } else {
            return res.status(403).json({ message: "Requête non autorisé" });
        }
    } catch (error) {
        return res.status(500).json({ error });
    }

};



/*Modifier la catégorie d'un utilisateur*/
exports.updateCategoryUser = async (req: any, res: Response, next: NextFunction) => {
    const categoryList = ['superAdmin', "admin", "user"]
    const userObject = { ...req.body };
    const userID = req.auth.userId;

    try {
        //Recherche de la catégorie de l'utilisateur auteur de la requête
        const reqUser = await User.findById(userID)
        if (reqUser.category === "superAdmin") {
            try {
                const updatedUser = await User.findById(req.params.id)
                //Si l'email de de l'utilisateur à mettre à jour est celui de l'administrateur en chef, la requête est refusé
                if (updatedUser.email === process.env.CHIEF_ADMIN_EMAIL) {
                    return res.status(403).json({ message: "Requête non autorisé" });
                } else {
                    try {
                        //La catégorie doit faire partie de la liste de catégories autorisées
                        if (categoryList.includes(userObject.category)) {
                            //Met à jour l'utilisateur'
                            await User.updateOne({ _id: req.params.id }, {
                                $set: {
                                    "category": userObject.category,
                                    "data.update.userId": userID,
                                    "data.update.time": Date.now()
                                }
                            })
                            return res.status(200).json({ message: "Catégorie mise à jour!" })
                        } else {
                            return res.status(403).json({ message: "Requête non autorisé" })
                        }
                    } catch (error) {
                        return res.status(502).json({ error })
                    }
                }
            } catch (error) {
                return res.status(501).json({ error })
            }
        } else {
            return res.status(403).json({ message: "Requête non autorisé" });
        }

    } catch (error) {
        return res.status(500).json({ error })
    }
};

/*Supprimer un utilisateur*/
exports.deleteUser = async (req: any, res: Response, next: NextFunction) => {
    const userID = req.auth.userId;

    try {
        const reqUser = await User.findById(userID)
        //Recherche de la catégorie de l'utilisateur
        if (reqUser.category === "superAdmin") {
            try {
                //Recherche de l'utilisateur dont on veut supprimer le compte
                const deleteUser = await User.findById(req.params.id)

                //Si l'email de de l'utilisateur à mettre à jour est celui de l'administrateur en chef, la requête est refusé
                if (deleteUser.email === process.env.CHIEF_ADMIN_EMAIL) {
                    res.status(403).json({ message: "Requête non autorisé" });
                } else {
                    try {
                        await User.deleteOne({ _id: req.params.id })
                        return res.status(200).json({ message: "Utilisateur supprimé !" })
                    } catch (error) {
                        res.status(502).json({ error });
                    }
                }
            } catch (error) {
                res.status(501).json({ error });
            }


        } else {
            res.status(403).json({ message: "Requête non autorisé" });
        }

    } catch (error) {
        res.status(500).json({ error });
    }
};

/*Affiche un utilisateur selon son id*/
exports.getOneUser = async (req: any, res: Response, next: NextFunction) => {
    const userID = req.auth.userId;

    //Recherche de la catégorie de l'utilisateur auteur de la requête
    try {
        const reqUser = await User.findById(userID)
        if (reqUser.category === "superAdmin" || req.params.id === userID) {
            try {
                const user = await User.findById(req.params.id)
                return res.status(200).json(user)
            } catch (error) {
                return res.status(501).json({ error })
            }
        }
        return res.status(403).json({ message: "Requête non autorisé" })
    } catch (error) {
        return res.status(500).json({ error });
    }
};


/*Affiche le nom d'un utilisateur selon son id*/
exports.getOneUserFullName = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.params.id)
        const FullName = `${user.name.firstName} ${user.name.lastName}`
        return res.status(200).json(FullName)
    } catch (error) {
        return res.status(500).json({ error });
    }
};



/*Affiche toutes les utilisateurs*/
exports.getAllUsers = async (req: any, res: Response, next: NextFunction) => {
    const userID = req.auth.userId
    //Recherche de la catégorie de l'utilisateur auteur de la requête
    try {
        const reqUser = await User.findById(userID)
        if (reqUser.category === "superAdmin") {
            try {
                const users = await User.find()
                return res.status(200).json(users)
            } catch (error) {
                return res.status(501).json({ error })
            }
        }
        return res.status(403).json({ message: "Requête non autorisé" })
    } catch (error) {
        return res.status(500).json({ error });
    }
};

/*Vérifie si il y a déjà un utilisateur enregistré*/
exports.firstUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const users = await User.find()
        if (users && users.length > 0) {
            return res.status(200).json(false);
        } else {
            return res.status(200).json(true);
        }
    } catch (error) {
        return res.status(500).json({ error })
    }
};

/*Vérification du mail*/
exports.verifyUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        //Recherche de l'utilisateur
        const reqUser = await User.findById(req.params.id)
        //L'utilisateur n'est pas présent dans la basse de données
        if (!reqUser) {
            return res.status(401).json({ message: "Ce lien n'est pas valide" });
        }
        //Le compte de l'utilisateur a déjà été vérifié
        if (reqUser.verified) {
            return res.status(200).json({ message: "Compte vérifié!" });
        }
        try {

            //Recherche du token
            const token = await Token.findOne({
                userId: reqUser.id,
                token: req.params.token
            })
            if (!token) {
                return res.status(401).json({ message: "Ce lien n'est pas valide" });
            }
            try {
                await User.updateOne({ _id: reqUser.id }, {
                    verified: true
                })
                await token.remove()
                return res.status(200).json({ message: "Compte vérifié!" });
            } catch (error) {
                return res.status(502).json({ error });
            }
        } catch (error) {
            return res.status(501).json({ error });
        }

    } catch (error) {
        return res.status(500).json({ error });
    }
};
