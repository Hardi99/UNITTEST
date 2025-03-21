const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
    orderNumber: { type: Number, required: true, unique: true },
    status: { 
        type: String, 
        enum: ['préparation', 'prêt', 'livré', 'annulée'],
        default: 'préparation'
    },
    items: [{
        item: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 }
    }],
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['card', 'cash'] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    estimatedTime: { type: Number, default: 30 }, // en minutes
    notes: [String]
});

const TrackingModel = mongoose.model('Tracking', trackingSchema);

class Tracking {
    constructor() {
        this.model = TrackingModel;
    }

    async createTracking(orderNumber, items, total) {
        try {
            const existingOrder = await this.model.findOne({ orderNumber });
            if (existingOrder) {
                return {
                    success: false,
                    message: 'Le suivi de cette commande existe déjà.'
                };
            }

            const tracking = new this.model({
                orderNumber,
                status: 'préparation',
                items: items,
                total: total,
                estimatedTime: 30 // 30 minutes par défaut
            });

            await tracking.save();
            return {
                success: true,
                tracking
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la création du suivi.',
                error: error.message
            };
        }
    }

    async updateStatus(orderNumber, newStatus) {
        try {
            const validStatuses = ['préparation', 'prêt', 'livré', 'annulée'];
            if (!validStatuses.includes(newStatus)) {
                return {
                    success: false,
                    message: 'Statut invalide.'
                };
            }

            const tracking = await this.model.findOneAndUpdate(
                { orderNumber },
                { 
                    status: newStatus,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!tracking) {
                return {
                    success: false,
                    message: 'Commande non trouvée.'
                };
            }

            return {
                success: true,
                tracking
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la mise à jour du statut.',
                error: error.message
            };
        }
    }

    async getOrderStatus(orderNumber) {
        try {
            const tracking = await this.model.findOne({ orderNumber });
            if (!tracking) {
                return {
                    success: false,
                    message: 'Commande non trouvée.'
                };
            }
            return {
                success: true,
                tracking
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la récupération du statut.',
                error: error.message
            };
        }
    }

    async cancelOrder(orderNumber) {
        try {
            const tracking = await this.model.findOne({ orderNumber });
            if (!tracking || tracking.status === 'livré') {
                return {
                    success: false,
                    message: 'Commande non trouvée.'
                };
            }

            const updatedTracking = await this.model.findOneAndUpdate(
                { orderNumber },
                { 
                    status: 'annulée',
                    updatedAt: new Date()
                },
                { new: true }
            );

            return {
                success: true,
                tracking: updatedTracking
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de l\'annulation de la commande.',
                error: error.message
            };
        }
    }

    async getTrackingDetails(orderNumber) {
        try {
            const tracking = await this.model.findOne({ orderNumber });
            if (!tracking) {
                return {
                    success: false,
                    message: 'Commande non trouvée.'
                };
            }
            return {
                success: true,
                tracking
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la récupération des détails.',
                error: error.message
            };
        }
    }

    async updateEstimatedTime(orderNumber, minutes) {
        try {
            const tracking = await this.model.findOneAndUpdate(
                { orderNumber },
                { 
                    estimatedTime: minutes,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!tracking) {
                return {
                    success: false,
                    message: 'Commande non trouvée.'
                };
            }

            return {
                success: true,
                tracking
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la mise à jour du temps estimé.',
                error: error.message
            };
        }
    }

    async addNote(orderNumber, note) {
        try {
            const tracking = await this.model.findOneAndUpdate(
                { orderNumber },
                { 
                    $push: { notes: note },
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!tracking) {
                return {
                    success: false,
                    message: 'Commande non trouvée.'
                };
            }

            return {
                success: true,
                tracking
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de l\'ajout de la note.',
                error: error.message
            };
        }
    }

    async updatePaymentMethod(orderNumber, paymentMethod) {
        try {
            const tracking = await this.model.findOneAndUpdate(
                { orderNumber },
                { 
                    paymentMethod,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!tracking) {
                return {
                    success: false,
                    message: 'Commande non trouvée.'
                };
            }

            return {
                success: true,
                tracking
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la mise à jour du mode de paiement.',
                error: error.message
            };
        }
    }
}

module.exports = Tracking;