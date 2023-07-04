/**
 * Gestion de la logique métier des routes de quotation
 **/
import { Response, NextFunction } from 'express';

const Quotation = require("../models/quotation");

/*Affiche un devis selon son id*/
exports.getOneQuotation = async (req: any, res: Response, next: NextFunction) => {
    const quotationID = req.params.id

    try {
        const reqQuotation = await Quotation.findById(quotationID)
        return res.status(200).json(reqQuotation)

    } catch (error) {
        return res.status(500).json({ error });
    }
};

/*Affiche tous les devis disponibles pour une commande*/
exports.getAllQuotations = async (req: any, res: Response, next: NextFunction) => {
    const orderID = req.params.id
    ///Récupération 
    try {
        const quotations = await Quotation.find()
        const quotationsList = quotations.filter((quotation: any) => quotation.orderId === orderID)

        return res.status(200).json(quotationsList)
    } catch (error) {
        return res.status(500).json({ error });
    }
};