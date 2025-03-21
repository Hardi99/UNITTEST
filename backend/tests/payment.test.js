const PaymentSystem = require('../models/payment_system');
const { connect, closeDatabase, clearDatabase } = require('../utils/testUtils');

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await closeDatabase();
});

describe('Système de Paiement', () => {
    let paymentSystem;

    beforeEach(async () => {
        await clearDatabase();
        paymentSystem = new PaymentSystem();
    });

    test('Traitement d\'un paiement valide', async () => {
        const result = await paymentSystem.processPayment(1, 50.00);
        expect(result.success).toBe(true);
        expect(result.orderNumber).toBe(1);
        expect(result.amount).toBe(50.00);
        expect(result.transactionId).toBeDefined();
    });

    test('Traitement d\'un paiement invalide', async () => {
        const result = await paymentSystem.processPayment(0, 50.00);
        expect(result.success).toBe(false);
        expect(result.message).toBe('Numéro de commande invalide ou montant incorrect.');
    });

    test('Récupération du statut d\'un paiement', async () => {
        await paymentSystem.processPayment(1, 50.00);
        const status = await paymentSystem.getPaymentStatus(1);
        expect(status.success).toBe(true);
        expect(status.status).toBe('validated');
        expect(status.amount).toBe(50.00);
        expect(status.transactionId).toBeDefined();
    });

    test('Récupération du statut d\'un paiement inexistant', async () => {
        const status = await paymentSystem.getPaymentStatus(999);
        expect(status.success).toBe(false);
        expect(status.message).toBe('Paiement non trouvé.');
    });

    test('Mise à jour du statut d\'un paiement', async () => {
        await paymentSystem.processPayment(1, 50.00);
        const result = await paymentSystem.updatePaymentStatus(1, 'refunded');
        expect(result.success).toBe(true);
        expect(result.status).toBe('refunded');
        expect(result.updatedAt).toBeDefined();
    });

    test('Récupération de l\'historique des paiements', async () => {
        await paymentSystem.processPayment(1, 50.00);
        await paymentSystem.processPayment(1, 30.00);
        const history = await paymentSystem.getPaymentHistory(1);
        expect(history.success).toBe(true);
        expect(history.payments).toHaveLength(2);
        expect(history.payments[0].amount).toBe(30.00);
        expect(history.payments[1].amount).toBe(50.00);
    });
});