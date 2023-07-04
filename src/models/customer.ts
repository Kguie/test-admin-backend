/**
 *Définition du schéma du modèle customer
 **/

//Import de mongoose pour utiliser les schémas

const mongooseCustomer = require("mongoose");
const uniqueValidatorCustomer = require("mongoose-unique-validator");

const customerSchema = mongooseCustomer.Schema({
    name: {
        firstName: {
            type: String,
            required: true,
            trim: true,
            match: [/^[a-zéèçàù\-,'\s]{1,20}$/gi, "Format du prénom invalide"]
        }, //tester la regex
        lastName: {
            type: String,
            required: true,
            trim: true,
            match: [/^[a-zéèçàù\-,'\s]{1,20}$/gi, "Format du nom invalide"],
        },
    },
    contact: {
        email: {
            type: String || null,
            trim: true,
            maxLength: [30, "Veuillez entrer au maximum 30 caractères"],
            match: [/^[a-z0-9!#$%&'*+=?^_`~\.-]{1,20}@[a-z0-9-!#$%&'*+=?^_`~-]{1,20}\.[a-z0-9]{1,20}$/gi, "Format du mail invalide"]
        }, // vérifier fonctionnement regex
        phoneNumber: {
            type: String || null,
            unique: true,
            required: true,
            trim: true,
            minLength: [9, "Veuillez entrer au minimum 10 caractères"],
            maxLength: [17, "Veuillez entrer au maximum 16 caractères"]
        },//Doit être un numéro de téléphone? ajustement en front
        secondPhoneNumber: {
            type: String || null,
            trim: true,
            minLength: [9, "Veuillez entrer au minimum 10 caractères"],
            maxLength: [17, "Veuillez entrer au maximum 16 caractères"]
        },//Doit être un numéro de téléphone? ajustement en front
        address: {
            type: String || null,
            trim: true,
            maxLength: 80
        },
        whatsapp: { type: Boolean, required: true, default: false },
        instagram: { type: Boolean, required: true, default: false },
        encounterWay: { type: String, maxLength: 100, trim: true },
    },
    comments: { type: String || null, maxLength: 500, trim: true },
    publications: { type: Boolean, default: true, required: true },//Accepte de recevoir des offres
    orders: { type: Array },//A compléter avec objet{orderId orderTime}
    data: {
        joining: { time: { type: Date, required: true }, userId: { type: String, required: true } }, //
        update: { time: { type: Date }, userId: { type: String } }
    },
});

//Améliore les messages d'erreur lors de l'enregistrement de données uniques
customerSchema.plugin(uniqueValidatorCustomer);

//exportation
module.exports = mongooseCustomer.model("Customer", customerSchema);