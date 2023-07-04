/**
 * Gestion de la configuration de multer pour l'importation d'image
 **/

import { RequestHandler } from 'express';

const multer = require("multer");
const path = require("path");



//Types de fichiers pris en compte
const MIME_TYPES: any = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png"
};

//Configuration du stockage
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        cb(null, "./public/images")
    },
    filename: (req: any, file: any, cb: any) => {
        //Supprime les espaces et les cas d'extensions écrites à l'intérieur du nom
        const fileName = file.originalname.split(" ").join("_");
        const name = path.parse(fileName).name;

        //Génération de l’extension
        const extension = MIME_TYPES[file.mimetype];
        const fullName = name + Date.now() + "." + extension

        cb(null, fullName);
    }
});

/*Vérification de l'extension*/
const filter = (req: any, file: any, cb: any) => {
    if ((file.mimetype).includes("jpeg") || (file.mimetype).includes("png") || (file.mimetype).includes("jpg")) {
        cb(null, true);
    } else {
        cb("Error: Seuls les fichiers jpg, jpeg, et png sont autorisés!");
    }
};


//Upload de l'image avec contrôle de la taille du fichier
let upload = multer({
    storage: storage,
    //Limite de taille de la photo 2 Mo
    limits: { fileSize: (2 * 1024 * 1024) },
    fileFilter: filter
});

let config = upload.single("image")

export default config;