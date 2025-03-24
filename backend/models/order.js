const mongoose = require('mongoose');                            // Importation de Mongoose pour interagir avec MongoDB


const orderSchema = new mongoose.Schema({                        // Définition du schéma pour une commande (Order)
    orderNumber: { type: Number, required: true, unique: true }, // Numéro de la commande, obligatoire et unique
    items: [{                                                    // Liste des articles dans la commande
        item: { type: String, required: true },                  // Nom de l'article, obligatoire
        price: { type: Number, required: true },                 // Prix de l'article, obligatoire
        quantity: { type: Number, default: 1 }                   // Quantité de l'article, par défaut à 1
    }],
    total: { type: Number, required: true },                     // Total de la commande, obligatoire
    status: { // Statut de la commande (par défaut "pending")
        type: String, 
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered'], // Statuts possibles
        default: 'pending'                                       // Statut par défaut est "en attente"
    },
    createdAt: { type: Date, default: Date.now }                 // Date de création de la commande, par défaut à la date actuelle
});

const OrderModel = mongoose.model('Order', orderSchema);         // Création du modèle 'Order' basé sur le schéma défini ci-dessus

class Order {                                                    // Classe Order pour gérer les opérations sur les commandes
    constructor() {
        this.model = OrderModel;                                 // Utilisation du modèle Order pour effectuer les opérations
        this.cart = [];                                          // Initialisation du panier comme tableau vide
        this.total = 0;                                          // Initialisation du total à 0
    }

    async addToCart(item, price) {                               // Méthode pour ajouter un article au panier
        this.cart.push({ item, price, quantity: 1 });            // Ajout de l'article avec un prix et une quantité de 1
        this.updateTotal();                                      // Mise à jour du total du panier
        return this.cart;                                        // Retourne le panier mis à jour
    }

    updateTotal() {                                              // Méthode pour mettre à jour le total du panier
        this.total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);  // Calcule le total du panier en multipliant le prix par la quantité pour chaque article et en faisant la somme
    }

    async applyPromotion(discount) {                             // Méthode pour appliquer une promotion (%)
        this.total -= this.total * (discount / 100);             // Applique une réduction en % au total
    }

    async placeOrder() {                                         // Méthode pour passer une commande
    const lastOrder = await this.model.findOne().sort({ orderNumber: -1 });  // Recherche de la dernière commande pour déterminer le prochain numéro de commande

    const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1; // Le prochain numéro de commande est le dernier + 1
        const orderDetails = {                                   // Détails de la commande à créer
            orderNumber: nextOrderNumber,                        // Numéro de la commande
            items: this.cart,                                    // Article du panier
            total: this.total.toFixed(2),                        // Total de la commande (arrondi à 2 décimales)
            status: 'pending'                                    // Statut initial de la commande est "en attente"
        };

        const newOrder = new this.model(orderDetails);           // Création d'une nouvelle commande à partir des détails
        await newOrder.save();                                   // Sauvegarde de la commande dans la base de données

        this.cart = [];                                          // Vide le panier après avoir passé la commande
        this.total = 0;                                          // Réinitialise le total après avoir passé la commande

        return orderDetails;                                     // Retourne les détails de la commande créée
    }
    
    async getOrder(orderNumber) {                                // Méthode pour obtenir une commande spécifique en fonction de son numéro
        return await this.model.findOne({ orderNumber });        // Recherche une commande par son numéro
    }

    async updateOrderStatus(orderNumber, status) {               // Méthode pour mettre à jour le statut d'une commande
        return await this.model.findOneAndUpdate(                // Recherche et met à jour le statut de la commande
            { orderNumber },                                     // Recherche la commande par son numéro
            { status },                                          // Mise à jour du statut de la commande
            { new: true }                                        // Retourne la commande mise à jour
        );
    }
    
    async getAllOrders() {                                       // Méthode pour obtenir toutes les commandes, triées par date de création
        return await this.model.find().sort({ createdAt: -1 });  // Recherche toutes les commandes triées par date de création
    }
}

module.exports = Order; // Exportation de la classe Order 
