const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderNumber: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'validated', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index composé pour orderNumber et createdAt
paymentSchema.index({ orderNumber: 1, createdAt: -1 });

const PaymentModel = mongoose.model('Payment', paymentSchema);

class PaymentSystem {
    constructor() {
        this.model = PaymentModel;
    }

    async processPayment(orderNumber, amount, paymentMethod = 'card') {
        if (!orderNumber || amount <= 0) {
            return { 
                success: false, 
                message: "Numéro de commande invalide ou montant incorrect." 
            };
        }

        try {
            const payment = new this.model({
                orderNumber,
                amount,
                paymentMethod,
                status: 'validated',
                transactionId: `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            });

            await payment.save();
            return { 
                success: true, 
                message: "Paiement effectué avec succès.", 
                orderNumber, 
                amount,
                transactionId: payment.transactionId
            };
        } catch (error) {
            return { 
                success: false, 
                message: "Erreur lors du traitement du paiement.",
                error: error.message
            };
        }
    }

    async getPaymentStatus(orderNumber) {
        try {
            const payment = await this.model.findOne({ orderNumber });
            if (!payment) {
                return { 
                    success: false, 
                    message: "Paiement non trouvé." 
                };
            }
            return {
                success: true,
                status: payment.status,
                amount: payment.amount,
                transactionId: payment.transactionId,
                createdAt: payment.createdAt
            };
        } catch (error) {
            return { 
                success: false, 
                message: "Erreur lors de la récupération du statut.",
                error: error.message
            };
        }
    }

    async updatePaymentStatus(orderNumber, status) {
        try {
            const payment = await this.model.findOneAndUpdate(
                { orderNumber },
                { 
                    status,
                    updatedAt: new Date()
                },
                { new: true }
            );
            if (!payment) {
                return { 
                    success: false, 
                    message: "Paiement non trouvé." 
                };
            }
            return {
                success: true,
                status: payment.status,
                updatedAt: payment.updatedAt
            };
        } catch (error) {
            return { 
                success: false, 
                message: "Erreur lors de la mise à jour du statut.",
                error: error.message
            };
        }
    }

    async getPaymentHistory(orderNumber) {
        try {
            const payments = await this.model.find({ orderNumber })
                .sort({ createdAt: -1 });
            return {
                success: true,
                payments
            };
        } catch (error) {
            return { 
                success: false, 
                message: "Erreur lors de la récupération de l'historique.",
                error: error.message
            };
        }
    }
}

module.exports = PaymentSystem;