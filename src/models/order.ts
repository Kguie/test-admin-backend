/**
 *Définition du schéma du modèle order
 **/

//Import de mongoose pour utiliser les schémas
const mongooseOrder = require('mongoose');

const payStatus = ["en attente", "acompte versé", "payé"]                   //Status du paiement
const orderStatus = ["devis demandé", "devis envoyé", "devis validé", "contacter client!", "livré", "annulé"]
const payBackStatus = ["non demandé,demandé,accepté,effectué,refusé,annulé"]


const orderSchema = mongooseOrder.Schema({

    //Données de commande
    data: {
        //date à laquelle la commande a été passée et id de l'auteur
        contact: {
            time: { type: Date, required: true },
            userId: { type: String, required: true }
        },
        //Date de la dernière mise à jour de la commande et id de l'auteur
        update: {
            time: { type: Date },
            userId: { type: String }
        }
    },

    //Partie Client
    customer: {
        //id du client
        id: { type: String, required: true },
        name: { type: String, required: true },
        //Requête initiale du client
        request:
            [
                {
                    pastryDescription: { type: String, required: true, maxLength: 1000 },
                    //Nombre de parts
                    size: { type: Number, required: true },
                    //Quantité de produits
                    quantity: { type: Number, required: true },
                    services: { type: String || null, maxLength: 1000 },
                }
            ],

        //Moyen de contact utilisé
        contactUsed: { type: String, required: true, maxLength: 40 },
        //Évènement
        event: { type: String, maxLength: 50, trim: true },
    },

    //Livraison
    delivery: {
        time: { type: Date, required: true },
        //Service de livraison
        service: { type: Boolean, required: true, default: false },
        location: { type: String || null, maxLength: 500, trim: true },
        comments: { type: String || null, maxLength: 500, trim: true },
    },

    //Devis actif
    chosenQuotation: { type: String || null },

    //Commentaires générales sur la commande
    comments: {
        type: String || null,
        trim: true,
        maxLength: 1000
    },

    //Evaluation du client
    evaluation: {
        quote: {
            type: String || null,
            trim: true,
            maxLength: 1000
        },
        way: { type: String || null, }
    },

    //Information de paiement
    paymentInfo: {
        //Montant total dû:
        totalToPay: { type: Number || null, },
        //Montant déjà payé par le client             
        payed: { type: Number, },
        //Reste à payer
        left: { type: Number, },
        //Méthode de paiement
        method: {
            type: { type: String || null },
        },
        status: {
            type: String,
            required: true,
            default: "en attente",
            validate: {
                validator: function (v: string) {
                    if (payStatus.includes(v)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                },
                message: (props: any) => `${props.value} is not a valid option!`
            },
        },
        //Information de remboursement
        payback: {
            //remboursement demandé ou non
            wanted: { type: Boolean, default: false },
            //Montant à rembourser
            amount: { type: Number || null },
            //Status
            status: {
                type: String, validate: {
                    validator: function (v: any) {
                        if (payBackStatus.includes(v)) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    },
                    message: (props: any) => `${props.value} is not a valid option!`
                },

            },
            //Raison du remboursement
            reason: { type: String || null, maxLength: 100 },
        },
    },




    //Status de la commande
    orderStatus: {
        type: String,
        required: true,
        validate: {
            validator: function (v: any) {
                if (orderStatus.includes(v)) {
                    return true;
                }
                else {
                    return false;
                }
            },
            message: (props: any) => `${props.value} is not a valid option!`
        },
    },

    //Informations pour les courses nécessaires à la commande
    shopping: {
        list: { type: Array, },
        price: { type: Number, },
        comments: { type: String, maxLength: 500 }
    },

    //Images
    pictures: {
        start: { type: Array },
        end: { type: Array }
    }
});



//exportation
module.exports = mongooseOrder.model("Order", orderSchema);

