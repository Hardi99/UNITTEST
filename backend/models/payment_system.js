const mongoose = require('mongoose');                     // Import Mongoose pour interagir avec MongoDB

const paymentSchema = new mongoose.Schema({               // Schéma pour un paiement
    orderNumber: { type: Number, required: true },        // Numéro de la commande, obligatoire
    amount: { type: Number, required: true },             // Montant du paiement, obligatoire
    status: {                                             // Statut du paiement (par défaut "en attente")
        type: String, 
        enum: ['pending', 'validated', 'failed', 'refunded'], // Statuts possibles pour un paiement
        default: 'pending'                                // Statut par défaut est "en attente"
    },
    paymentMethod: { type: String, required: true },      // Méthode de paiement, obligatoire (par exemple : 'card')
    transactionId: { type: String, unique: true },        // ID unique de la transaction
    createdAt: { type: Date, default: Date.now },         // Date de création du paiement, par défaut à la date actuelle
    updatedAt: { type: Date, default: Date.now }          // Date de mise à jour du paiement, par défaut à la date actuelle
});

paymentSchema.index({ orderNumber: 1, createdAt: -1 });   // Création d'un index composé pour 'orderNumber' et 'createdAt' pour optimiser les requêtes

const PaymentModel = mongoose.model('Payment', paymentSchema); // Création du modèle Payment à partir du schéma défini

class PaymentSystem {                                     // Classe PaymentSystem pour gérer les paiements
    constructor() {
        this.model = PaymentModel;                        // Utilisation du modèle Payment pour effectuer les opérations
    }

    async processPayment(orderNumber, amount, paymentMethod = 'card') { // Méthode pour traiter un paiement
        if (!orderNumber || amount <= 0) {                // Vérifie si le numéro de commande est valide et si le montant est correct
            return { 
                success: false, 
                message: "Numéro de commande invalide ou montant incorrect." 
            };
        }

        try {
            const payment = new this.model({              // Crée un nouvel objet paiement avec les informations de la commande
                orderNumber,
                amount,
                paymentMethod,
                status: 'validated',                      // Statut initial du paiement est "validated"
                transactionId: `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Génère un ID de transaction unique
            });

            await payment.save();                         // Sauvegarde le paiement dans la base de données
            return { 
                success: true, 
                message: "Paiement effectué avec succès.", 
                orderNumber, 
                amount,
                transactionId: payment.transactionId      // Retourne le succès avec les détails du paiement
            };
        } catch (error) {                                 // Si une erreur se produit lors du traitement du paiement
            return { 
                success: false, 
                message: "Erreur lors du traitement du paiement.",
                error: error.message                      // Retourne l'erreur rencontrée
            };
        }
    }

    async getPaymentStatus(orderNumber) {                 // Méthode pour récupérer le statut d'un paiement en fonction du numéro de commande
        try {
            const payment = await this.model.findOne({ orderNumber }); // Recherche du paiement correspondant au numéro de commande
            if (!payment) {                               // Si aucun paiement n'est trouvé pour ce numéro de commande
                return { 
                    success: false, 
                    message: "Paiement non trouvé." 
                };
            }
            return {
                success: true,
                status: payment.status,                    // Retourne le statut du paiement
                amount: payment.amount,                    // Montant du paiement
                transactionId: payment.transactionId,      // ID de la transaction
                createdAt: payment.createdAt               // Date de création du paiement
            };
        } catch (error) {                                  // Si une erreur se produit lors de la récupération du statut
            return { 
                success: false, 
                message: "Erreur lors de la récupération du statut.",
                error: error.message                       // Retourne l'erreur rencontrée
            };
        }
    }
    
    async updatePaymentStatus(orderNumber, status) {       // Méthode pour mettre à jour le statut d'un paiement en fonction du numéro de commande
        try {
            const payment = await this.model.findOneAndUpdate( // Recherche et mise à jour du statut du paiement
                { orderNumber },                           // Recherche le paiement par numéro de commande
                { 
                    status,                                // Mise à jour du statut
                    updatedAt: new Date()                  // Mise à jour de la date de modification
                },
                { new: true }                              // Retourne l'objet mis à jour
            );
            if (!payment) {                                // Si aucun paiement n'est trouvé
                return { 
                    success: false, 
                    message: "Paiement non trouvé." 
                };
            }
            return {
                success: true,
                status: payment.status,                    // Retourne le statut mis à jour
                updatedAt: payment.updatedAt               // Retourne la date de mise à jour
            };
        } catch (error) {                                  // Si une erreur se produit lors de la mise à jour du statut
            return { 
                success: false, 
                message: "Erreur lors de la mise à jour du statut.",
                error: error.message                       // Retourne l'erreur rencontrée
            };
        }
    }
    
    async getPaymentHistory(orderNumber) {                 // Méthode pour récupérer l'historique des paiements d'une commande
        try {
            const payments = await this.model.find({ orderNumber }) // Recherche de tous les paiements associés à un numéro de commande, triés par date de création (plus récents en premier)
                .sort({ createdAt: -1 });
            return {
                success: true,
                payments                                   // Retourne l'historique des paiements
            };
        } catch (error) {                                  // Si une erreur se produit lors de la récupération de l'historique
            return { 
                success: false, 
                message: "Erreur lors de la récupération de l'historique.",
                error: error.message                       // Retourne l'erreur rencontrée
            };
        }
    }
}

module.exports = PaymentSystem; // Export PaymentSystem 
