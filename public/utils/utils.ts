/**
 * Fonctions et variables utilitaires
 **/

type Props = {
    subTotalList: Array<any>,
    subTotalPrice: number,
}



/**
* Calcule la somme des prix à partir d'une liste
* @param {Array<any>} list 
* @returns {Number} prix total 
*/
export function calculatePrice(list: Array<any>) {
    let subTotalList: Array<any> = [];
    list.forEach(element => {
        //Calcul du sous total pour chaque article
        let subTotalPrice: Number = (element.quantity ? element.quantity : 1) * element.price;
        subTotalList.push(subTotalPrice);
    })
    //Addition des valeurs de la liste
    let totalPrice = subTotalList.reduce((previousValue, currentValue) =>
        previousValue + currentValue, 0
    );
    return totalPrice
}

/**
* Crée une liste de courses constituée des noms des ingrédients,de la quantité nécessaire,du prix moyen,de l'endroit ou l'acheter moins cher,du conditionnement dans lequel il est vendu     *  
* @param {Array<any>} list 
* @returns {Array}liste de courses
*/
export function shoppingListMaker(list: Array<any>) {
    let shoppingList: Array<any> = [];
    list.forEach(element => {
        const ingredient = {
            id: element.id,
            name: element.name,
            quantity: element.quantity,
            mediumPrice: element.mediumPrice,
            bestBuy: element.bestBuy,
            packaging: element.packaging
        }

        //Vérification que le produit ajouté n'est pas déjà dans la liste
        let ingredientFound = shoppingList.find(ingredient => ingredient.id === element.id);
        //Si le produit ayant le même id est présent on ajoute la quantité souhaité 
        if (!ingredientFound) {
            shoppingList.push(ingredient);
        } else {
            ingredientFound.quantity = ingredientFound.quantity + element.quantity;
        }
    });
    return shoppingList;
}

/**
* Retourne l'estimation du prix total des courses à partir de la liste de course
* @param {Array<any>} list 
* @returns {number}prix total
*/
export function getShoppingPrice(list: Array<any>) {
    let subTotalList: Array<any> = [];
    list.forEach(element => {
        //Calcul du sous total pour chaque article
        let subTotalPrice = element.quantity * element.mediumPrice;
        subTotalList.push(subTotalPrice);
    });
    //Addition des valeurs de la liste
    let totalPrice = subTotalList.reduce((previousValue, currentValue) =>
        previousValue + currentValue, 0
    );
    return totalPrice
}

/**
 * Retourne le status du paiement
 * @param {number} somme dû 
 *  @param {number} prix total
 * @returns {string} status du paiement
 */
export function changePaymentStatus(leftToPay: Number, totalToPay: Number) {
    if (leftToPay === 0)
        return "payé"

    if (leftToPay === totalToPay)
        return "en attente"

    else
        return "acompte versé"
}



