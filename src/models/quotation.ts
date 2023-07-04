/**
 *Définition du schéma du modèle quotation,permet la gestion des devis
 **/

//Import de mongoose pour utiliser les schémas
const mongooseQuotation = require('mongoose');

const quotationSchema = mongooseQuotation.Schema({
    //Données sur le client
    customer: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        phone: { type: String },
        mail: { type: String }
    },
    //Données de création du devis
    data: {
        userId: { type: String, required: true },
        time: { type: Date, required: true }
    },

    //Liste des patisseries
    pastriesList: [
        {
            pastryId: { type: String, },
            pastryName: { type: String, },
            description: { type: String || null },
            //Nombre de parts
            size: { type: Number, },
            //Quantité de produits
            quantity: { type: Number, },
            services: [{ type: String || null }],
            comments: { type: String || null, maxLength: 1000 },
            price: { type: Number, }
        }
    ],
    //Liste des services
    servicesList: [
        {
            serviceId: { type: String },
            name: { type: String },
            description: { type: String || null },
            price: { type: Number }
        }
    ],
    totalPrice: { type: Number, required: true },
    //Réduction
    reduction: {
        reason: { type: String || null },
        amount: { type: Number },
    },
    finalPrice: { type: Number, required: true },
    //Numéro de la commande concernée par ce devis
    orderId: { type: String, required: true },
    deliveryDate: { type: Date, required: true },
})

//exportation
module.exports = mongooseQuotation.model("Quotation", quotationSchema);