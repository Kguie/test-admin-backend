/**
 *Définition du schéma pour le modèle utilisateur
 **/

//Import de mongoose pour utiliser les schémas
const uniqueValidator = require("mongoose-unique-validator");
const mongooseUser = require("mongoose");

const userCategory = ["superAdmin", "admin", "user"]

const userSchema: any = mongooseUser.Schema({
    name: {
        firstName: {
            type: String,
            required: true,
            maxLength: 30,
            trim: true,
            match: [/^[a-zéèçàù\-,'\s]{1,20}$/gi, "Format du prénom invalide"]
        }, //tester la regex
        lastName: {
            type: String,
            required: true,
            trim: true,
            maxLength: 30,
            match: [/^[a-zéèçàù\-,'\s]{1,20}$/gi, "Format du nom invalide"],
        },
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        maxLength: 100,
        match: [/^[a-z0-9!#$%&'*+=?^_`~\.-]{1,20}@[a-z0-9-!#$%&'*+=?^_`~-]{1,20}\.[a-z0-9]{1,20}$/gi, "Format du mail invalide"]
    },
    password: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        default: "user",
        maxLength: 15,
        trim: true,
        validate: {
            validator: function (v: string) {
                if (userCategory.includes(v)) {
                    return true;
                }
                else {
                    return false;
                }
            },
            message: (props: any) => `${props.value} is not a valid option!`
        },
    },
    data: {
        joinDate: { type: Date, require: true, }, //
        update: { time: { type: Date }, userId: { type: String } }
    },
    lastConnect: { type: Date, },
    verified: { type: Boolean, default: false }
});

//Améliore les messages d'erreur lors de l'enregistrement de données uniques
userSchema.plugin(uniqueValidator);

//exportation
module.exports = mongooseUser.model("User", userSchema);