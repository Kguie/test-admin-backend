/**
 * Gestion de la logique métier des routes de order
 **/

//Rajouter un update qui fait que quand on ajoute  un gateau à une commande on ajoute la quantité commandée à un compteur de ce gateau
import { Response, NextFunction } from 'express';
import { calculatePrice, changePaymentStatus } from '../../public/utils/utils'

const fs = require("fs");

const Order = require("../models/order");
const User = require("../models/user");
const Customer = require("../models/customer");
const Quotation = require("../models/quotation");

/*Ajouter une nouvelle commande*/
exports.addOrder = async (req: any, res: Response, next: NextFunction) => {
    const userID = req.auth.userId;
    const orderObject = { ...req.body };

    //Sécurité
    delete orderObject._id;
    delete orderObject.data;
    //delete orderObject.customerId  pour l'instant non nécessaire
    delete orderObject.customer.name;
    delete orderObject.evaluation;
    delete orderObject.paymentInfo;
    delete orderObject.pictures;
    delete orderObject.quotation
    delete orderObject.shopping

    //Récupération du nom du client
    try {
        const customer = await Customer.findById(orderObject.customer.id)

        const order = new Order({
            ...orderObject,
            data: {
                contact: {
                    time: Date.now(),
                    userId: userID
                }
            },
            orderStatus: "devis demandé",
            pictures: {
                start: [],
                end: []
            },
            customer: {
                id: orderObject.customer.id,
                name: `${customer.name.lastName} ${customer.name.firstName}`,
                request: orderObject.customer.request,
                contactUsed: orderObject.customer.contactUsed,
                event: orderObject.customer.event
            }
        });

        try {
            //Enregistrement de la commande dans la base de données
            await order.save()

            try {
                //Ajout de la commande dans l'objet du Client 
                await Customer.updateOne({ _id: order.customer.id }, {
                    $push: { orders: order.id }
                })
                return res.status(201).json({ message: "Commande ajouté !" })
            } catch (error) {
                return res.status(502).json({ error })
            }
        } catch (error) {
            return res.status(501).json({ error });
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
};


/*Modifier le contenu et les détails d'une commande*/
exports.updateOrder = async (req: any, res: Response, next: NextFunction) => {
    const orderObject = { ...req.body };
    const userID = req.auth.userId;
    const orderID = req.params.id

    //Sécurités
    delete orderObject._id;
    delete orderObject.data;
    delete orderObject.quotation;
    delete orderObject.pictures;


    //Recherche de la commande que l'on veut modifier
    try {
        const reqOrder = await Order.findById(orderID)
        //Refus de passer l'étape status validé si aucun devis n'a été sélectionné
        if (orderObject.orderStatus && !(orderObject.orderStatus === 'devis demandé' || orderObject.orderStatus === 'devis envoyé' || orderObject.orderStatus === 'annulé') && !reqOrder.chosenQuotation) {
            return res.status(401).json({ message: "Veuillez valider un devis avant de passer à l'étape suivante" })

        }
        //Status contacter client
        if ((orderObject.basket || orderObject.delivery || orderObject.evaluation || orderObject.paymentInfo || orderObject.payBack || orderObject.shopping) && reqOrder.orderStatus === "contacter client!") {
            return res.status(401).json({ message: "Veuillez contacter le client avant modification de la commande" })
        }

        //Refus de l'évaluation si le status de la commande n'est pas sur livrée ou annulée
        if (orderObject.evaluation && ((orderObject.evaluation.quote || orderObject.evaluation.way) && ((reqOrder.orderStatus === "devis demandé") || (reqOrder.orderStatus === "devis envoyé")))) {
            return res.status(401).json({ message: "Veuillez d'abord changer le status de la commande au moins à devis validé avant d'ajouter une évaluation" })
        }

        //Recherche de la présence d'un devis validé
        if (reqOrder.chosenQuotation) {

            //Reste à payer
            const leftToPay = reqOrder.paymentInfo.totalToPay - (orderObject.payed ? orderObject.payed : 0);
            //Remboursement
            const paybackAmount = (orderObject.wanted) ? orderObject.amount : null;

            //Mise à jour de la commande avec calcul des infos de commandes
            try {
                await Order.updateOne({ _id: orderID }, {
                    ...orderObject,
                    $set: {
                        "data.update.userId": userID,
                        "data.update.time": Date.now(),

                        "paymentInfo.payed": orderObject.payed ? orderObject.payed : 0,
                        "paymentInfo.method": orderObject.method ? orderObject.method : (reqOrder.paymentInfo.method ? reqOrder.paymentInfo.method : null),
                        "paymentInfo.left": leftToPay,
                        "paymentInfo.status": changePaymentStatus(leftToPay, reqOrder.paymentInfo.totalToPay),

                        "paymentInfo.payback.amount": paybackAmount,
                        "paymentInfo.payback.reason": orderObject.reason,
                        "paymentInfo.payback.wanted": orderObject.wanted,
                        "paymentInfo.payback.status": orderObject.status,
                    },
                })

                return res.status(200).json({ message: "Commande modifiée!" })
            } catch (error) {
                return res.status(503).json({ error });
            }


            //Pas de devis validé
        } else {
            delete orderObject.paymentInfo;
            //Mise à jour de la commande avec calcul des infos de commandes
            try {
                await Order.updateOne({ _id: orderID }, {
                    ...orderObject,
                    $set: {
                        "data.update.userId": userID,
                        "data.update.time": Date.now(),
                    },
                })
                return res.status(200).json({ message: "Commande modifiée!" })
            } catch (error) {
                return res.status(501).json({ error });
            }
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
};

/*Ajout d'un devis à la commande*/
exports.addQuotation = async (req: any, res: Response, next: NextFunction) => {
    const orderObject = { ...req.body };
    const orderID = req.params.id
    const userID = req.auth.userId;

    //Calcul des données de paiement
    //Pourcentage de réduction
    const reduction = orderObject.quotation && orderObject.quotation.reduction.amount ? orderObject.quotation.reduction.amount / 100 : 0
    //Prix à payer
    const totalToPay = (calculatePrice(orderObject.quotation.pastriesList) + ((orderObject.quotation.servicesList && orderObject.quotation.servicesList.length > 0) ? calculatePrice(orderObject.quotation.servicesList) : 0))
    //Prix à payer après réduction
    const finalPrice = totalToPay - (totalToPay * reduction);

    try {
        const reqOrder = await Order.findById(orderID)

        //Recherche du client destinataire du devis
        try {
            const reqCustomer = reqOrder.customer && await Customer.findById(reqOrder.customer.id)

            //Création du devis
            try {
                const newQuotation = new Quotation({
                    customer: {
                        id: reqOrder.customer && reqOrder.customer.id,
                        name: reqOrder.customer && reqOrder.customer.name,
                        phone: reqCustomer.contact && reqCustomer.contact.phoneNumber,
                        mail: reqCustomer.contact && reqCustomer.contact.email,
                    },
                    orderId: orderID,
                    data: {
                        userId: userID,
                        time: Date.now()
                    },
                    deliveryDate: reqOrder.delivery && reqOrder.delivery.time,
                    pastriesList: orderObject.quotation.pastriesList,
                    servicesList: orderObject.quotation.servicesList,
                    totalPrice: totalToPay,
                    reduction: {
                        reason: orderObject.quotation.reduction && orderObject.quotation.reduction.reason,
                        amount: orderObject.quotation.reduction && orderObject.quotation.reduction.amount
                    },
                    finalPrice: finalPrice
                })

                await newQuotation.save()
                //Mise à jour de la commande
                try {
                    await Order.updateOne({ _id: orderID }, {
                        $set: {
                            "data.update.userId": userID,
                            "data.update.time": Date.now()
                        }
                    })
                    return res.status(201).json({ message: "Le devis a bien été créé!" })
                } catch (error) {
                    return res.status(503).json({ error });
                }
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

/*Suppression d'un devis*/
exports.deleteQuotation = async (req: any, res: Response, next: NextFunction) => {
    const orderObject = { ...req.body };
    const orderID = req.params.id
    const userID = req.auth.userId;

    //Recherche de la commande à modifier
    try {
        const reqOrder = await Order.findById(orderID)

        try {
            //Si le devis est actuellement le devis actif
            if (orderObject.quotationId === reqOrder.chosenQuotation) {
                return res.status(401).json({ message: "Requête impossible! Veuillez sélectionner un autre devis avant de supprimer celui là" })
            }
            await Quotation.deleteOne({ _id: orderObject.quotationId })

            //Mise à jour de la commande
            try {
                await Order.updateOne({ _id: orderID }, {
                    $set: {
                        "data.update.userId": userID,
                        "data.update.time": Date.now(),
                    }
                })
                return res.status(200).json({ message: "Le devis a bien été supprimé!" })
            } catch (error) {
                return res.status(502).json({ error });
            }
        } catch (error) {
            return res.status(501).json({ error });
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
}

/*Gestion de la validation d'un devis*/
exports.validQuotation = async (req: any, res: Response, next: NextFunction) => {
    const orderObject = { ...req.body };
    const orderID = req.params.id
    const userID = req.auth.userId;

    //Recherche de la commande à modifier
    try {
        const reqOrder = await Order.findById(orderID)

        //Récupération du devis
        try {
            const chosenQuotation = await Quotation.findById(orderObject.quotationId)

            //Cas où le devis sélectionné n'est pas encore validé
            if (!reqOrder.chosenQuotation || reqOrder.chosenQuotation !== orderObject.quotationId) {
                //Reste à payer
                const leftToPay = chosenQuotation.finalPrice - (reqOrder.paymentInfo.payed ? - reqOrder.paymentInfo.payed : 0);
                //Ajout de l'id du devis sélectionné
                try {
                    await Order.updateOne({ _id: orderID }, {
                        $set: {
                            "data.update.userId": userID,
                            "data.update.time": Date.now(),
                            "chosenQuotation": orderObject.quotationId,
                            "paymentInfo.left": leftToPay,
                            "paymentInfo.status": changePaymentStatus(leftToPay, chosenQuotation.finalPrice),
                            "paymentInfo.totalToPay": chosenQuotation.finalPrice,
                            "orderStatus": "devis validé"
                        }
                    })
                    return res.status(200).json({ message: "Devis validé!" })
                } catch (error) {
                    return res.status(502).json({ error });
                }
            }

            //Cas où le devis sélectionné n'est pas encore validé
            else {
                //Reste à payer
                const leftToPay = (reqOrder.paymentInfo.payed ? - reqOrder.paymentInfo.payed : 0);
                //Suppression de l'id du devis sélectionné
                try {
                    await Order.updateOne({ _id: orderID }, {
                        $set: {
                            "data.update.userId": userID,
                            "data.update.time": Date.now(),
                            "chosenQuotation": null,
                            "paymentInfo.left": leftToPay,
                            "paymentInfo.status": reqOrder.paymentInfo.payed ? 'acompte versé' : 'en attente',
                            "paymentInfo.totalToPay": null,
                            "orderStatus": "devis demandé"
                        }
                    })
                    return res.status(200).json({ message: "Le devis n'est plus validé!" })
                } catch (error) {
                    return res.status(502).json({ error });
                }
            }
        } catch (error) {
            return res.status(501).json({ error });
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
};

/*Modifier le client destinataire de la commande*/
exports.updateOrdersCustomer = async (req: any, res: Response, next: NextFunction) => {
    const orderObject = { ...req.body };
    const orderID = req.params.id
    const userID = req.auth.userId;

    //Recherche de la commande
    try {
        const reqOrder = await Order.findById(orderID)
        const oldCustomerId = reqOrder.customer.id

        try {
            //Mise à jour des commandes dans la fiche client
            await Customer.updateOne({ _id: oldCustomerId }, {
                $set: {
                    "data.update.userId": userID,
                    "data.update.time": Date.now(),
                },
                $pull: {
                    "orders": orderID
                }
            })
            try {
                //Recherche du nouveau client
                const newCustomer = await Customer.findById(orderObject.customer.id)
                const fullName: string = newCustomer.name && `${newCustomer.name.lastName} ${newCustomer.name.firstName}`
                try {
                    //Mise à jour de la commande                    
                    await Order.updateOne({ _id: reqOrder.id }, {
                        $set: {
                            "customer.id": newCustomer.id,
                            "customer.name": fullName,
                            "data.update.time": Date.now(),
                            "data.update.userId": userID
                        }
                    });
                    try {
                        //Mise à jour des commandes dans la fiche client
                        await Customer.updateOne({ _id: orderObject.customer.id }, {
                            $set: {
                                "data.update.userId": userID,
                                "data.update.time": Date.now(),
                            },
                            $push: {
                                "orders": orderID
                            }
                        })
                        return res.status(200).json({ message: "Destinataire de la commande mis à jour!" })
                    } catch (error) {
                        return res.status(504).json({ error });
                    }
                } catch (error) {
                    return res.status(503).json({ error });
                }
            } catch (error) {
                return res.status(502).json({ error });
            }
        } catch (error) {
            return res.status(501).json({ error });
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
}

/*Gestions des photos de la commande*/
exports.orderPhotosManager = async (req: any, res: Response, next: NextFunction) => {
    const orderObject = req.file ? {
        ...req.body,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    } : { ...req.body };

    const userID = req.auth.userId;
    const orderID = req.params.id


    //Recherche de la commande
    try {
        const reqOrder = await Order.findById(orderID)

        //Modification des photos de la catégorie start
        if (orderObject.category === "start") {
            //Suppression de photo
            if (!req.file) {
                //url à supprimer
                const url = orderObject.url

                try {
                    const filename = url.split("/images/")[1];
                    fs.unlink(`public/images/${filename}`, async () => {
                        await Order.updateOne({ _id: orderID }, {
                            $set: {
                                "data.update.userId": userID,
                                "data.update.time": Date.now(),
                            },
                            $pull: {
                                "pictures.start": url
                            }
                        })
                    })
                    return res.status(200).json({ message: "Photos mises à jour!" })
                } catch (error) {
                    return res.status(504).json({ error });
                }
            } else {
                //Ajout de l'image
                try {
                    await Order.updateOne({ _id: orderID }, {
                        $set: {
                            "data.update.userId": userID,
                            "data.update.time": Date.now()
                        },
                        $push: {
                            "pictures.start": orderObject.imageUrl
                        }
                    })
                    return res.status(200).json({ message: "Photos mises à jour!" })
                } catch (error) {
                    return res.status(503).json({ error });
                }
            }
        } else {
            //Modification des photos de la catégorie fin
            if (reqOrder.orderStatus === "devis demandé" || reqOrder.orderStatus === "devis envoyé") {
                return res.status(401).json({ message: "Veuillez d'abord changer le status de la commande au moins à devis validé avant de modifier les photos de fin" })
            }
            //Suppression de photo
            if (!req.file) {
                //url à supprimer
                const url = orderObject.url
                try {
                    const filename = url.split("images/")[1];
                    fs.unlink(`public/images/${filename}`, async () => {
                        await Order.updateOne({ _id: orderID }, {
                            $set: {
                                "data.update.userId": userID,
                                "data.update.time": Date.now(),
                            },
                            $pull: {
                                "pictures.end": url
                            }
                        })
                    });

                    return res.status(200).json({ message: "Photos mises à jour!" })

                } catch (error) {
                    return res.status(502).json({ error });
                }
            } else {
                //Ajout de l'image
                try {
                    await Order.updateOne({ _id: orderID }, {
                        $set: {
                            "data.update.userId": userID,
                            "data.update.time": Date.now(),
                        },
                        $push: {
                            "pictures.end": orderObject.imageUrl
                        }
                    })
                    return res.status(200).json({ message: "Photos mises à jour!" })
                } catch (error) {
                    return res.status(501).json({ error });
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
}

/*Supprimer une commande*/
exports.deleteOrder = async (req: any, res: Response, next: NextFunction) => {
    const userID = req.auth.userId;
    const orderID = req.params.id

    try {
        //Vérification de la catégorie de l'auteur de la requête
        const reqUser = await User.findById(userID);

        if (reqUser.category === 'admin' || reqUser.category === 'superAdmin') {
            try {
                //Recherche de la commande à supprimer 
                const reqOrder = await Order.findById(orderID);


                //Recherche des devis liés à la commande si il yen a
                try {
                    const quotations = await Quotation.find()
                    const quotationsList = quotations.filter((quotation: any) => quotation.orderId === orderID)

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


                //Suppression des photos enregistrées après vérification 
                const startArray: Array<any> = reqOrder.pictures.start
                const endArray: Array<any> = reqOrder.pictures.end

                if (startArray.length > 0) {
                    startArray.forEach((url: string) => {
                        const filename = url.split("images/")[1];
                        // Supprime la photo
                        fs.unlink(`public/images/${filename}`, (err: any) => {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log(`La photo ${filename} a été supprimée avec succès.`);
                            }
                        });
                    })
                }
                if (endArray.length > 0) {
                    endArray.forEach((url: string) => {
                        const filename = url.split("images/")[1];
                        // Supprime la photo
                        fs.unlink(`public/images/${filename}`, (err: any) => {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log(`La photo ${filename} a été supprimée avec succès.`);
                            }
                        });
                    })
                }

                try {
                    //Suppression de la commande
                    await Order.deleteOne({ _id: orderID })


                    try {
                        //Mise à jour des commandes dans la fiche client
                        await Customer.updateOne({ _id: reqOrder.customer.id }, {
                            $set: {
                                "data.update.userId": userID,
                                "data.update.time": Date.now(),
                            },
                            $pull: {
                                "orders": orderID
                            }
                        })
                        return res.status(200).json({ message: "Commande supprimée!" })
                    } catch (error) {
                        return res.status(503).json({ error });
                    }
                } catch (error) {
                    return res.status(502).json({ error });
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


/*Affiche une commande selon son id*/
exports.getOneOrder = async (req: any, res: Response, next: NextFunction) => {
    const orderID = req.params.id

    try {
        const reqOrder = await Order.findById(orderID)
        return res.status(200).json(reqOrder)

    } catch (error) {
        return res.status(500).json({ error });
    }
};


/*Affiche toutes les commandes*/
exports.getAllOrders = async (req: any, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find()
        return res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({ error });
    }
};

/*Affiche toutes les commandes d'un client*/
exports.getAllCustomerOrders = async (req: any, res: Response, next: NextFunction) => {
    const customerID = req.params.id
    ///Récupération 
    try {
        const orders = await Order.find()
        const customerOrdersList = orders.filter((order: any) => order.customer.id === customerID)

        return res.status(200).json(customerOrdersList)
    } catch (error) {
        return res.status(500).json({ error });
    }
};


//Trier les commandes en fonction de leur utilisateur


