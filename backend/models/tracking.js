const mongoose = require('mongoose');                      // Import Mongoose pour interagir avec MongoDB

const trackingSchema = new mongoose.Schema({               // Schéma pour le suivi d'une commande
    orderNumber: { type: Number, required: true, unique: true }, // Numéro de la commande, obligatoire et unique
    status: {                                              // Statut de la commande, avec des options prédéfinies
        type: String, 
        enum: ['préparation', 'prêt', 'livré', 'annulée'], // Statuts possibles
        default: 'préparation'                             // Statut par défaut est "préparation"
    },
    items: [{                                              // Liste des article de la commande
        item: { type: String, required: true },            // Nom de l'article, obligatoire
        price: { type: Number, required: true },           // Prix de l'article, obligatoire
        quantity: { type: Number, default: 1 }             // Quantité de l'article, par défaut 1
    }],
    total: { type: Number, required: true },               // Montant total de la commande, obligatoire
    paymentMethod: { type: String, enum: ['card', 'cash'] }, // Méthode de paiement, peut être 'card' ou 'cash'
    createdAt: { type: Date, default: Date.now },          // Date de création de la commande, par défaut à la date actuelle
    updatedAt: { type: Date, default: Date.now },          // Date de mise à jour de la commande, par défaut à la date actuelle
    estimatedTime: { type: Number, default: 30 },          // Temps estimé pour la livraison en minutes, par défaut 30
    notes: [String]                                        // Liste de notes associées à la commande
});

const TrackingModel = mongoose.model('Tracking', trackingSchema); // Création du modèle 'Tracking' basé sur le schéma défini ci-dessus

class Tracking {                                           // Classe Tracking pour gérer les opérations liées au suivi des commandes
    constructor() {
        this.model = TrackingModel;                        // Utilisation du modèle Tracking pour effectuer les opérations
    }

    async createTracking(orderNumber, items, total) {      // Méthode pour créer un suivi de commande
        try {
            const existingOrder = await this.model.findOne({ orderNumber }); // Vérifie si le suivi existe déjà
            if (existingOrder) {                           // Si un suivi existe déjà pour cette commande
                return {
                    success: false,
                    message: 'Le suivi de cette commande existe déjà.' // Retourne une erreur
                };
            }

            const tracking = new this.model({               // Crée un nouvel objet de suivi pour la commande
                orderNumber,
                status: 'préparation',                      // Statut initial de la commande
                items: items,
                total: total,
                estimatedTime: 30                           // Temps estimé de 30 minutes par défaut
            });

            await tracking.save();                          // Sauvegarde le suivi dans la base de données
            return {
                success: true,
                tracking                                    // Retourne le suivi de la commande créé
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la création du suivi.', // Retourne l'erreur si la création échoue
                error: error.message
            };
        }
    }
    
    async updateStatus(orderNumber, newStatus) {            // Méthode pour mettre à jour le statut d'une commande
        try {
            const validStatuses = ['préparation', 'prêt', 'livré', 'annulée']; // Statuts valides
            if (!validStatuses.includes(newStatus)) {       // Si le nouveau statut est invalide
                return {
                    success: false,
                    message: 'Statut invalide.'             // Retourne un message d'erreur
                };
        
            const tracking = await this.model.findOneAndUpdate( // Met à jour le statut de la commande
                { orderNumber },                                // Recherche la commande par son numéro
                { 
                    status: newStatus,                          // Mise à jour du statut
                    updatedAt: new Date()                       // Mise à jour de la date de modification
                },
                { new: true }                                   // Retourne l'objet mis à jour
            );

            if (!tracking) {                                    // Si la commande n'est pas trouvée
                return {
                    success: false,
                    message: 'Commande non trouvée.'            // Retourne un message d'erreur
                };
            }

            return {
                success: true,
                tracking                                        // Retourne le suivi mis à jour
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la mise à jour du statut.', // Si une erreur se produit lors de la mise à jour
                error: error.message
            };
        }
    }

    async getOrderStatus(orderNumber) {                          // Méthode pour obtenir le statut d'une commande
        try {
            const tracking = await this.model.findOne({ orderNumber }); // Recherche du suivi pour la commande
            if (!tracking) {                                     // Si la commande n'est pas trouvée
                return {
                    success: false,
                    message: 'Commande non trouvée.'             // Retourne un message d'erreur
                };
            }
            return {
                success: true,
                tracking                                         // Retourne les détails du suivi de la commande
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la récupération du statut.', // Si une erreur se produit lors de la récupération du statut
                error: error.message
            };
        }
    }

    async cancelOrder(orderNumber) {                              // Méthode pour annuler une commande
        try {
            const tracking = await this.model.findOne({ orderNumber }); // Recherche du suivi de la commande
            if (!tracking || tracking.status === 'livré') {       // Si la commande n'est pas trouvée ou déjà livrée
                return {
                    success: false,
                    message: 'Commande non trouvée.'              // Retourne un message d'erreur
                };
            }

            const updatedTracking = await this.model.findOneAndUpdate( // Met à jour le statut de la commande à "annulée"
                { orderNumber },
                { 
                    status: 'annulée',                             // Statut de la commande mis à "annulée"
                    updatedAt: new Date()                          // Mise à jour de la date de modification
                },
                { new: true }                                      // Retourne l'objet mis à jour
            );

            return {
                success: true,
                tracking: updatedTracking                          // Retourne le suivi mis à jour
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de l\'annulation de la commande.', // Si une erreur se produit lors de l'annulation
                error: error.message
            };
        }
    }

    async getTrackingDetails(orderNumber) {                        // Méthode pour obtenir les détails du suivi d'une commande
        try {
            const tracking = await this.model.findOne({ orderNumber }); // Recherche du suivi pour la commande
            if (!tracking) {                                       // Si la commande n'est pas trouvée
                return {
                    success: false,
                    message: 'Commande non trouvée.'               // Retourne un message d'erreur
                };
            }
            return {
                success: true,
                tracking                                           // Retourne les détails du suivi de la commande
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la récupération des détails.', // Si une erreur se produit lors de la récupération des détails
                error: error.message
            };
        }
    }

    async updateEstimatedTime(orderNumber, minutes) {               // Méthode pour mettre à jour le temps estimé de livraison
        try {
            const tracking = await this.model.findOneAndUpdate(
                { orderNumber },
                { 
                    estimatedTime: minutes,                         // Mise à jour du temps estimé de livraison
                    updatedAt: new Date()                           // Mise à jour de la date de modification
                },
                { new: true }                                       // Retourne l'objet mis à jour
            );

            if (!tracking) {                                        // Si la commande n'est pas trouvée
                return {
                    success: false,
                    message: 'Commande non trouvée.'                // Retourne un message d'erreur
                };
            }

            return {
                success: true,
                tracking                                            // Retourne le suivi mis à jour
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la mise à jour du temps estimé.', // Si une erreur se produit lors de la mise à jour
                error: error.message
            };
        }
    }

    async addNote(orderNumber, note) {                              // Méthode pour ajouter une note à une commande
        try {
            const tracking = await this.model.findOneAndUpdate(
                { orderNumber },
                { 
                    $push: { notes: note },                         // Ajoute la note à la liste des notes
                    updatedAt: new Date()                           // Mise à jour de la date de modification
                },
                { new: true }                                       // Retourne l'objet mis à jour
            );

            if (!tracking) {                                        // Si la commande n'est pas trouvée
                return {
                    success: false,
                    message: 'Commande non trouvée.'                // Retourne un message d'erreur
                };
            }

            return {
                success: true,
                tracking                                            // Retourne le suivi mis à jour avec la note ajoutée
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de l\'ajout de la note.',      // Si une erreur se produit lors de l'ajout de la note
                error: error.message
            };
        }
    }
    async updatePaymentMethod(orderNumber, paymentMethod) {          // Méthode pour mettre à jour le mode de paiement de la commande
        try {
            const tracking = await this.model.findOneAndUpdate(
                { orderNumber },
                { 
                    paymentMethod,                                   // Mise à jour du mode de paiement
                    updatedAt: new Date()                            // Mise à jour de la date de modification
                },
                { new: true }                                        // Retourne l'objet mis à jour
            );

            if (!tracking) {                                         // Si la commande n'est pas trouvée
                return {
                    success: false,
                    message: 'Commande non trouvée.'                 // Retourne un message d'erreur
                };
            }

            return {
                success: true,
                tracking                                             // Retourne le suivi mis à jour avec le mode de paiement modifié
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la mise à jour du mode de paiement.', // Si une erreur se produit lors de la mise à jour
                error: error.message
            };
        }
    }
}

module.exports = Tracking; // Export Tracking
