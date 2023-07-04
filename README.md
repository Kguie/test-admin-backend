# TEST-Admin-Backend

[![Version](https://img.shields.io/badge/version-1.0-blue.svg)](https://github.com/Kguie/my-e-portfolio)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

Ce repo contient le code de l'API pour l'application web TEST-Admin-app pour la gestion des commandes de



## Table des Matières

- [Introduction](#introduction)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Consommer l'API](#consommer-l-api)
- [Structure du Projet](#structure-du-projet)
- [Licence](#licence)
- [Auteurs](#auteurs)
- [Contact](#contact)

## Introduction

- Ce projet est une API rest qui va de paire avec le projet TEST-react-app-admin.


## Installation

- Prérequis système : Ce e-portfolio est réalisé sous React typescript avec l'utilisation de bootstrap et de sass.
- Installation des dépendances : Cloner ce repository et lancer `yarn install` pour installer les dépendances.

## Utilisation

- Utiliser  `yarn start` pour lancer l'application.
- Ouvrir [http://localhost:3000](http://localhost:3000) pour le  voir dans le navigateur.


## Consommer l 'API

L'API TEST-Admin-App est une API REST. 
Une fois lancée, cette API met plusieurs routes à votre disposition

- Les routes User (utilisateur) :

    ● Route de connection d'un utilisateur (Permet d'acquérir le token nécessaire à l'authentification):
    `POST /users/login`

    ● Route pour ajouter un utilisateur (authentification requise) :
    `POST /users/add-user`

    ● Route pour demander la réinitialisation de son mot de passe (authentification requise) :
    `POST /users/reset-password/`

    ● Route pour modifier un utilisateur (authentification requise) :
    `PUT /users/:id`

    ● Route pour définir le nouveau mot de passe :
    `PUT /users/update-password/:id/:token`

    ● Route pour changer la catégorie (authentification requise) :
    `PUT /users/category/:id`

    ● Route pour supprimer un utilisateur (authentification requise) :
    `DEL /users/:id`

    ● Route pour récupérer les données de tous les utilisateurs (authentification requise) :
    `GET /users`

    ● Route pour avoir le détail d'un utilisateur (authentification requise) :
    `GET /users/:id`

    ● Route pour obtenir juste le nom d'un utilisateur (authentification requise) :
    `GET /users/name/:id`

    ● Route pour la vérification du token de création du compte utilisateur (authentification requise) :
    `GET /users/verify/:id/:token`


- Les routes Customers (client) :

    ● Route pour ajouter un client (authentification requise):
    `POST /customers/add-customer`

    ● Route pour modifier un client (authentification requise) :
    `PUT /customers/:id`

    ● Route pour supprimer un client (authentification requise) :
    `DELETE /customers/:id`

    ● Route pour récupérer les données de tous les clients (authentification requise) :
    `GET /customers`

    ● Route pour avoir le détail d'un client :
    `GET /customers/:id`


- Les routes Orders (commandes) :

    ● Route pour ajouter une commande(authentification requise):
    `POST /orders/add-order`

    ● Route pour modifier une commande,exceptés le nom du client,les devis,les photos (authentification requise):
    `PUT /orders/:id`

    ● Route pour modifier le client destinataire d'une commande(authentification requise):
    `PUT /orders/:id/customer`

    ● Route pour ajouter un devis à une commande(authentification requise):
    `PUT /orders/:id/add-quotation`

    ● Route pour supprimer un devis d'une commande(authentification requise):
    `PUT /orders/:id/delete-quotation`

    ● Route pour valider le devis d'une commande(authentification requise):
    `PUT /orders/:id/valid-quotation`

    ● Route pour ajouter ou supprimer une photo dans une commande(authentification requise):
    `PUT /orders/:id/photo`

    ● Route pour supprimer une commande (authentification requise):
    `DELETE /orders/:id`

    ● Route pour récupérer les données de toutes les commandes (authentification requise):
    `GET /orders`

    ● Route pour avoir le détail d'une commande (authentification requise):
    `GET /orders/:id`


- Les routes Quotations (devis) :

    ● Route pour récupérer les données du devis dont on rentre l'id (authentification requise):
    `GET /quotations/:id`

    ● Route pour avoir le détail de tous les devis liés à la commande dont on rentre l'id (authentification requise):
    `GET /quotations/order/:id`
    

- Les routes Logs (connections) :

    ● Route pour récupérer toutes les données de connection (authentification requise):
    `GET /logs/`             

## Structure du Projet

- api/                  # Functions de l'api
- public/               # Dossier contenant les images et fichiers publics
- src/controllers/      # Dossier contenant les controllers
- src/middleware/       # Contient les middlewares
- src/models/           # Contient les models
- src/routes/           # Contient les routes  
- src/app.js            # Fichier js de l'application 


## Auteurs

- [GUIEBA Kévin](https://github.com/Kguie/)

## Contact

- Si vous vous voulez me contacter, vous pouvez le faire à cette adresse: kevin.guieba@gmail.com