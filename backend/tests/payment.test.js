const PaymentSystem = require('../models/payment_system');                        // Importation du modèle PaymentSystem et des utilitaires de test
const { connect, closeDatabase, clearDatabase } = require('../utils/testUtils');


beforeAll(async () => {                                                           // Avant tous les tests, se connecter à la base de données
    await connect();                                                              // Connexion à la base de données
});


afterAll(async () => {                                                            // Après tous les tests, fermer la connexion à la base de données
    await closeDatabase();                                                        // Fermeture de la base de données
});


describe('Système de Paiement', () => {                                            // Suite de tests pour le système de paiement
    let paymentSystem;                                                             // Déclaration de la variable paymentSystem

    
    beforeEach(async () => {                                                       // Avant chaque test, nettoyer la base de données et initialiser un nouvel objet paymentSystem
        await clearDatabase();                                                     // Nettoyage de la base de données
        paymentSystem = new PaymentSystem();                                       // Création d'un nouvel objet PaymentSystem
    });

    
    test('Traitement d\'un paiement valide', async () => {                         // Test pour le traitement d'un paiement valide
        const result = await paymentSystem.processPayment(1, 50.00);               // Traitement d'un paiement valide
        expect(result.success).toBe(true);                                         // Vérifie que le paiement a été traité avec succès
        expect(result.orderNumber).toBe(1);                                        // Vérifie que le numéro de la commande est correct
        expect(result.amount).toBe(50.00);                                         // Vérifie que le montant du paiement est correct
        expect(result.transactionId).toBeDefined();                                // Vérifie qu'un ID de transaction a été généré
    });

   
    test('Traitement d\'un paiement invalide', async () => {                       // Test pour le traitement d'un paiement invalide
        const result = await paymentSystem.processPayment(0, 50.00);               // Traitement d'un paiement avec un numéro de commande invalide
        expect(result.success).toBe(false);                                        // Vérifie que le paiement a échoué
        expect(result.message).toBe('Numéro de commande invalide ou montant incorrect.'); // Vérifie que le message d'erreur est correct
    });

    
    test('Récupération du statut d\'un paiement', async () => {                     // Test pour récupérer le statut d'un paiement
        await paymentSystem.processPayment(1, 50.00);                               // Traitement d'un paiement valide
        const status = await paymentSystem.getPaymentStatus(1);                     // Récupération du  statut du paiement
        expect(status.success).toBe(true);                                          // Vérifie que le statut a été récupéré avec succès
        expect(status.status).toBe('validated');                                    // Vérifie que le statut du paiement est "valide"
        expect(status.amount).toBe(50.00);                                          // Vérifie que le montant du paiement est correct
        expect(status.transactionId).toBeDefined();                                 // Vérifie que l'ID de transaction est défini
    });

  
    test('Récupération du statut d\'un paiement inexistant', async () => {           // Test pour récupérer le statut d'un paiement inexistant
        const status = await paymentSystem.getPaymentStatus(999);                    // Tentative de récupération du statut pour un paiement inexistant
        expect(status.success).toBe(false);                                          // Vérifie que la récupération échoue
        expect(status.message).toBe('Paiement non trouvé.');                         // Vérifie que le message d'erreur est correct
    });

   
    test('Mise à jour du statut d\'un paiement', async () => {                        // Test pour la mise à jour du statut d'un paiement
        await paymentSystem.processPayment(1, 50.00);                                 // Traitement d'un paiement valide
        const result = await paymentSystem.updatePaymentStatus(1, 'refunded');        // Mise à jour du statut du paiement à "refusé"
        expect(result.success).toBe(true);                                            // Vérifie que la mise à jour a réussi
        expect(result.status).toBe('refunded');                                       // Vérifie que le statut a bien été mis à jour à "refusé"
        expect(result.updatedAt).toBeDefined();                                       // Vérifie que la date de mise à jour est définie
    });

    
    test('Récupération de l\'historique des paiements', async () => {                 // Test pour récupérer l'historique des paiements d'une commande
        await paymentSystem.processPayment(1, 50.00);                                 // Traitement d'un paiement de 50.00
        await paymentSystem.processPayment(1, 30.00);                                 // Traitement d'un autre paiement de 30.00
        const history = await paymentSystem.getPaymentHistory(1);                     // Récupération de l'historique des paiements pour la commande 1
        expect(history.success).toBe(true);                                           // Vérifie que l'historique a été récupéré avec succès
        expect(history.payments).toHaveLength(2);                                     // Vérifie qu'il y a 2 paiements dans l'historique
        expect(history.payments[0].amount).toBe(30.00);                               // Vérifie que le premier paiement est de 30.00
        expect(history.payments[1].amount).toBe(50.00);                               // Vérifie que le deuxième paiement est de 50.00
    });
});
