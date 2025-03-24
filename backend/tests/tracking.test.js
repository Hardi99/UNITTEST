const Tracking = require('../models/tracking');                                   // Importation du modèle Tracking et des utilitaires de test
const { connect, closeDatabase, clearDatabase } = require('../utils/testUtils');


beforeAll(async () => {                                                           // Avant tous les tests, se connecter à la base de données
    await connect();                                                              // Connexion à la base de données
});


afterAll(async () => {                                                             // Après tous les tests, fermer la connexion à la base de données
    await closeDatabase();                                                         // Fermeture de la base de données
});


describe('Suivi des Commandes', () => {                                            // Suite de tests pour le suivi des commandes
    let tracking;                                                                  // Déclaration de la variable tracking
    const testItems = [                                                            // Définition des items de test
        { item: 'Burger', price: 10, quantity: 2 }, 
        { item: 'Frites', price: 5, quantity: 1 }
    ];
    const testTotal = 25;                                                           // Total attendu pour la commande

    
    beforeEach(async () => {                                                        // Avant chaque test, nettoyer la base de données et initialiser un nouvel objet tracking
        await clearDatabase();                                                      // Nettoyage de la base de données
        tracking = new Tracking();                                                  // Création d'un nouvel objet Tracking
    });

   
    const compareItems = (actual, expected) => {                                     // Fonction utilitaire pour comparer les items dans la commande
        const cleanActual = actual.map(item => ({
            item: item.item,
            price: item.price,
            quantity: item.quantity
        }));
        const cleanExpected = expected.map(item => ({
            item: item.item,
            price: item.price,
            quantity: item.quantity || 1
        }));
        console.log('Clean Actual:', JSON.stringify(cleanActual));                    // Affiche les items réels
        console.log('Clean Expected:', JSON.stringify(cleanExpected));                // Affiche les items attendus
        return JSON.stringify(cleanActual) === JSON.stringify(cleanExpected);         // Compare les items réels et attendus
    };

   
    test('Création d\'une commande', async () => {                                    // Test pour la création d'une commande
        const result = await tracking.createTracking(1, testItems, testTotal);        // Création du suivi pour une commande
        expect(result.success).toBe(true);                                            // Vérifie que la création du suivi a réussi
        expect(result.tracking.orderNumber).toBe(1);                                  // Vérifie que le numéro de la commande est correct
        expect(result.tracking.status).toBe('préparation');                           // Vérifie que le statut initial est "préparation"
        expect(compareItems(result.tracking.items, testItems)).toBe(true);            // Vérifie que les items correspondent
        expect(result.tracking.total).toBe(testTotal);                                // Vérifie que le total de la commande est correct
    });

    test('Création d\'une commande existante', async () => {                          // Test pour la création d'une commande déjà existante
        await tracking.createTracking(1, testItems, testTotal);                       // Création du suivi pour une commande
        const result = await tracking.createTracking(1, testItems, testTotal);        // Tentative de création d'un suivi pour une commande existante
        expect(result.success).toBe(false); // Vérifie que la création échoue
        expect(result.message).toBe('Le suivi de cette commande existe déjà.');       // Vérifie que le message d'erreur est correct
    });

    
    test('Mise à jour du statut d\'une commande', async () => {                       // Test pour la mise à jour du statut d'une commande
        await tracking.createTracking(1, testItems, testTotal);                       // Création du suivi pour une commande
        const result = await tracking.updateStatus(1, 'prêt');                        // Mise à jour du statu t à "prêt"
        expect(result.success).toBe(true);                                            // Vérifie que la mise à jour a réussi
        expect(result.tracking.status).toBe('prêt');                                  // Vérifie que le statut a bien été mis à jour
    });

   
    test('Mise à jour du statut d\'une commande inexistante', async () => {           // Test pour la mise à jour du statut d'une commande inexistante
        const result = await tracking.updateStatus(999, 'prêt');                      // Tentative de mise à jour du statut pour une commande inexistante
        expect(result.success).toBe(false);                                           // Vérifie que la mise à jour échoue
        expect(result.message).toBe('Commande non trouvée.');                         // Vérifie que le message d'erreur est correct
    });

  
    test('Récupération du statut d\'une commande inexistante', async () => {          // Test pour récupérer le statut d'une commande inexistante
        const result = await tracking.getOrderStatus(999);                            // Tentative de récupération du statut pour une commande inexistante
        expect(result.success).toBe(false);                                           // Vérifie que la récupération échoue
        expect(result.message).toBe('Commande non trouvée.');                         // Vérifie que le message d'erreur est correct
    });

  
    test('Annulation d\'une commande', async () => {                                  // Test pour annuler une commande
        await tracking.createTracking(1, testItems, testTotal);                       // Création du suivi pour une commande
        const result = await tracking.cancelOrder(1);                                 // Annulation de la commande
        expect(result.success).toBe(true);                                            // Vérifie que l'annulation a réussi
        expect(result.tracking.status).toBe('annulée');                               // Vérifie que le statut est mis à jour à "annulée"
    });

  
    test('Annulation d\'une commande inexistante', async () => {                      // Test pour annuler une commande inexistante
        const result = await tracking.cancelOrder(999);                               // Tentative d'annulation d'une commande inexistante
        expect(result.success).toBe(false);                                           // Vérifie que l'annulation échoue
        expect(result.message).toBe('Commande non trouvée.');                         // Vérifie que le message d'erreur est correct
    });

    
    test('Récupération des détails de suivi', async () => {                            // Test pour récupérer les détails de suivi d'une commande
        await tracking.createTracking(1, testItems, testTotal);                        // Création du suivi pour une commande
        await tracking.updateStatus(1, 'prêt');                                        // Mise à jour du statut à "prêt"
        const result = await tracking.getTrackingDetails(1);                           // Récupération des détails de suivi de la commande
        expect(result.success).toBe(true);                                             // Vérifie que la récupération des détails a réussi
        expect(result.tracking.orderNumber).toBe(1);                                   // Vérifie que le numéro de la commande est correct
        expect(result.tracking.status).toBe('prêt');                                   // Vérifie que le statut est "prêt"
        expect(compareItems(result.tracking.items, testItems)).toBe(true);             // Vérifie que les articles correspondent
        expect(result.tracking.total).toBe(testTotal);                                 // Vérifie que le total est correct
    });


    test('Mise à jour du temps de livraison estimé', async () => {                      // Test pour la mise à jour du temps de livraison estimé
        await tracking.createTracking(1, testItems, testTotal);                         // Création du suivi pour une commande
        const result = await tracking.updateEstimatedTime(1, 30);                       // Mise à jour du temps estimé à 30 minutes
        expect(result.success).toBe(true);                                              // Vérifie que la mise à jour a réussi
        expect(result.tracking.estimatedTime).toBe(30);                                 // Vérifie que le temps estimé a été mis à jour
    });

   
    test('Ajout d\'une note à une commande', async () => {                               // Test pour l'ajout d'une note à une commande
        await tracking.createTracking(1, testItems, testTotal);                          // Création du suivi pour une commande
        const result = await tracking.addNote(1, 'Note de test');                        // Ajout d'une note à la commande
        expect(result.success).toBe(true);                                               // Vérifie que l'ajout de la note a réussi
        expect(result.tracking.notes).toContain('Note de test');                         // Vérifie que la note a été ajoutée aux notes de la commande
    });
});
