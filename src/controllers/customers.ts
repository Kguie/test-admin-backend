/**
 * Gestion de la logique métier des routes customers
 **/
import { Response, NextFunction } from 'express';

const Customer = require("../models/customer");
const User = require("../models/user");
const Quotation = require("../models/quotation");
const Order = require("../models/order");

/*Ajoute un nouveau client*/
exports.addCustomer = async (req: any, res: Response, next: NextFunction) => {
    const customerObject = { ...req.body };
    const userID = req.auth.userId;

    //Recherche du user auteur de la requête
    try {
        const reqUser = await User.findById(userID)
        if (reqUser.category === "superAdmin" || reqUser.category === "admin") {
            //Effacement de plusieurs données non requises par sécurité
            delete customerObject._id;
            delete customerObject.data;
            delete customerObject.orders;

            if (customerObject.contact.email === null) {
                delete customerObject.contact.email
            }
            if (customerObject.contact.secondPhoneNumber === null) {
                delete customerObject.contact.secondPhoneNumber
            }
            if (customerObject.contact.address === null) {
                delete customerObject.contact.address
            }
            if (customerObject.contact.encounterWay === null) {
                delete customerObject.contact.encounterWay
            }
            if (customerObject.comments === null) {
                delete customerObject.comments
            }

            //Recherche du téléphone du client dans la BDD
            if (customerObject.contact && customerObject.contact.phoneNumber) {
                try {

                    const newCustomer = await Customer.findOne({ "contact.phoneNumber": customerObject.contact.phoneNumber })
                    if (newCustomer) {
                        return res.status(401).json({ message: "Ce numéro est déjà utilisé par un client" });
                    }
                } catch (error) {
                    return res.status(503).json({ error });
                }
            }

            //Recherche du mail du client dans la BDD
            if (customerObject.contact && customerObject.contact.email) {
                try {
                    const secondCustomer = await Customer.findOne({ "email": customerObject.contact.email })
                    if (secondCustomer) {
                        return res.status(401).json({ message: "Cette adresse émail est déjà utilisée par un client" });
                    }
                } catch (error) {
                    return res.status(502).json({ error });
                }
            }

            const customer = new Customer({
                ...customerObject,
                data: {
                    joining: {
                        userId: userID,
                        time: Date.now()
                    }
                },
            });
            //Enregistrement du nouveau client dans la base de données
            try {
                await customer.save()
                return res.status(201).json({ message: "Client ajouté !", customer })
            } catch (error) {
                return res.status(501).json({ error });
            }
        } else {
            return res.status(403).json({ message: "Requête non autorisé" });
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
}

/*Modifier un client*/
exports.updateCustomer = async (req: any, res: Response, next: NextFunction) => {
    const customerObject = { ...req.body };
    const userID = req.auth.userId;

    //Recherche de l'auteur de la requête
    try {
        const reqUser = await User.findById(userID)
        if (reqUser.category === "superAdmin" || reqUser.category === "admin") {
            //Effacement de plusieurs données non requises par sécurité
            delete customerObject._id;
            delete customerObject.data;
            delete customerObject.orders;

            //Recherche du téléphone du client dans la BDD
            if (customerObject.contact && customerObject.contact.phone) {
                try {
                    const newCustomer = await Customer.findOne({ "phone": customerObject.contact.phone })
                    if (newCustomer) {
                        return res.status(401).json({ message: "Ce numéro est déjà utilisé par un client" });
                    }
                } catch (error) {
                    return res.status(503).json({ error });
                }
            }

            //Recherche du mail du client dans la BDD
            if (customerObject.contact && customerObject.contact.email) {
                try {
                    const newCustomer = await Customer.findOne({ "email": customerObject.contact.email })
                    if (newCustomer) {
                        return res.status(401).json({ message: "Cette adresse émail est déjà utilisée par un client" });
                    }
                } catch (error) {
                    return res.status(502).json({ error });
                }
            }

            //Mise à jour du client
            try {
                await Customer.updateOne({ _id: req.params.id }, {
                    ...customerObject,
                    $set: {
                        "data.update.userId": reqUser.id,
                        "data.update.time": Date.now()
                    }
                })
                return res.status(202).json({ message: "Client mis à jour!" })
            } catch (error) {
                return res.status(501).json({ error });
            }
        } else {
            return res.status(403).json({ message: "Requête non autorisé" });
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
}


/*Supprimer un client*/
exports.deleteCustomer = async (req: any, res: Response, next: NextFunction) => {
    const customerId = req.params.id;
    const userID = req.auth.userId;
    //Recherche de la catégorie de l'utilisateur auteur de la requête
    try {
        const reqUser = await User.findById(userID);
        if (reqUser.category === 'admin' || reqUser.category === 'superAdmin') {

            //Recherche du client
            try {
                const reqCustomer = await Customer.findById(customerId);
                //Suppression des commandes si il y en a
                const ordersList = reqCustomer.orders && reqCustomer.orders

                if (ordersList && ordersList.length > 0) {
                    ordersList.forEach(async (orderId: any) => {
                        //Recherche des devis liés à la commande si il yen a
                        try {
                            const quotations = await Quotation.find()
                            const quotationsList = quotations.filter((quotation: any) => quotation.orderId === orderId)
                            if (quotationsList && quotationsList.length > 0) {
                                quotationsList.forEach(async (quotation: any) => {
                                    try {
                                        await Quotation.deleteOne({ _id: quotation._id })
                                    } catch (error) {
                                        return res.status(505).json({ error });
                                    }
                                })
                            }
                        } catch (error) {
                            return res.status(504).json({ error });
                        }
                        //Puis suppression de la commande
                        try {
                            await Order.deleteOne({ _id: orderId })
                        } catch (error) {
                            return res.status(503).json({ error });
                        }
                    });
                }
                //Suppression du client
                try {
                    await Customer.deleteOne({ _id: customerId });
                    return res.status(200).json({ message: "Client supprimé !" })

                } catch (error) {
                    res.status(502).json({ error });
                }
            } catch (error) {
                res.status(501).json({ error });
            }
        } else {
            return res.status(403).json({ message: "Requête non autorisé" });
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
};


/*Affiche un client selon son id*/
exports.getOneCustomer = async (req: any, res: Response, next: NextFunction) => {
    try {
        const customer = await Customer.findById(req.params.id)
        return res.status(200).json(customer)
    } catch (error) {
        return res.status(500).json({ error });
    }
};

/*Affiche le nom d'un client selon son id*/
exports.getOneCustomerFullName = async (req: any, res: Response, next: NextFunction) => {
    try {
        const customer = await Customer.findById(req.params.id)
        const FullName = `${customer.name.firstName} ${customer.name.lastName}`
        return res.status(200).json(FullName)
    } catch (error) {
        return res.status(500).json({ error });
    }
};


/*Affiche tous les clients*/
exports.getAllCustomers = async (req: any, res: Response, next: NextFunction) => {
    try {
        const customers = await Customer.find()
        return res.status(200).json(customers)

    } catch (error) {
        return res.status(500).json({ error });
    }
};




