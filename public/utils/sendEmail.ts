/**
 * Fonction d'envoi de mail
 **/

const nodemailer = require("nodemailer")

/**
 * Permet l'envoie de mail, les promise ont été ajouté pour le fonctionnement sur vercel
 * @param {string} email - Adresse du destinataire 
 * @param {string} object - Objet de l'Émail 
 * @param {any} text - Contenu de l'Émail 
 */
export async function sendEmail(email: string, object: string, text: any,) {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.verify
        console.log("Server is ready to take our messages");
    } catch (error) {
        return false;
    }

    //A améliorer avec l'ajout d'une page html en lieu et place du text
    const mailOptions = {
        from: "Test admin",
        to: email,
        subject: object,
        text: text,

    };

    try {
        await transporter.sendMail(mailOptions)
        return true;
    } catch (error) {
        return false;
    }
}