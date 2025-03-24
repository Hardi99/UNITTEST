const Order = require('../models/order');                                                // Import Order et des utilitaires de test
const { connect, closeDatabase, clearDatabase } = require('../utils/testUtils');

beforeAll(async () => {                                                                  // Avant tous les tests, se connecter à la base de données
    await connect();                                                                     // Connexion à la base de données
}, 10000);                                                                               // Timeout de 10 secondes pour la connexion

afterAll(async () => {                                                                   // Après tous les tests, fermer la connexion à la base de données
    await closeDatabase();                                                               // Fermeture de la base de données
}, 10000);                                                                               // Timeout de 10 secondes pour la fermeture


describe('Gestion des Commandes', () => {                                                // Suite de tests pour la gestion des commandes
    let order;                                                                           // Déclaration de la variable order pour chaque test

    beforeEach(async () => {                                                             // Avant chaque test, nettoyer la base de données et initialiser un nouvel objet order
        await clearDatabase();                                                           // Nettoyage de la base de données
        order = new Order();                                                             // Création d'un nouvel objet Order
    }, 10000);                                                                           // Timeout de 10 secondes pour chaque initialisation

 
    test('Ajout d\'un article au panier', async () => {                                  // Test pour l'ajout d'un article au panier
        const result = await order.addToCart('Pizza', 12.99);                            // Ajout d'un article au panier
        expect(result).toHaveLength(1);                                                  // Vérifie qu'il y a 1 article dans le panier
        expect(result[0].item).toBe('Pizza');                                            // Vérifie que le nom de l'article est correct
        expect(result[0].price).toBe(12.99);                                             // Vérifie que le prix de l'article est correct
        expect(result[0].quantity).toBe(1);                                              // Vérifie que la quantité est correcte (1 par défaut)
    });

    test('Calcul du total du panier', async () => {                                      // Test pour le calcul du total du panier
        await order.addToCart('Pizza', 12.99);                                           // Ajout de la première pizza
        await order.addToCart('Salade', 8.99);                                           // Ajout d'une salade
        order.updateTotal();                                                             // Mise à jour du total
        expect(order.total).toBeCloseTo(21.98, 2);                                       // Vérifie que le total est bien égal à 21.98 avec une précision de 2 décimales
    });

    
    test('Application d\'une promotion', async () => {                                    // Test pour l'application d'une promotion (réduction en %)
        await order.addToCart('Pizza', 12.99);                                            // Ajout de la pizza
        await order.addToCart('Salade', 8.99);                                            // Ajout de la salade
        order.updateTotal();                                                              // Mise à jour du total
        await order.applyPromotion(10);                                                   // Application d'une réduction de 10%
        expect(order.total).toBeCloseTo(19.78, 2);                                        // Vérifie que le total après réduction est bien de 19.78
    });

    
    test('Passer une commande', async () => {                                             // Test pour passer une commande
        await order.addToCart('Pizza', 12.99);                                            // Ajout de la pizza
        order.updateTotal();                                                              // Mise à jour du total
        const result = await order.placeOrder();                                          // Passation de la commande
        expect(result.orderNumber).toBe(1);                                               // Vérifie que le numéro de la commande est correct (le premier numéro de commande)
        expect(result.items).toHaveLength(1);                                             // Vérifie que la commande contient un article
        expect(result.total).toBe('12.99');                                               // Vérifie que le total de la commande est correct
        expect(result.status).toBe('pending');                                            // Vérifie que le statut de la commande est "en attente"
    });

   
    test('Récupérer une commande', async () => {                                           // Test pour récupérer une commande par son numéro
        await order.addToCart('Pizza', 12.99);                                             // Ajout de la pizza
        order.updateTotal();                                                               // Mise à jour du total
        const orderDetails = await order.placeOrder();                                     // Passation de la commande
        const retrievedOrder = await order.getOrder(orderDetails.orderNumber);             // Récupération de la commande par son numéro
        expect(retrievedOrder.orderNumber).toBe(orderDetails.orderNumber);                 // Vérifie que le numéro de la commande correspond
        expect(retrievedOrder.items).toHaveLength(1);                                      // Vérifie que la commande contient un article
    });

   
    test('Mettre à jour le statut d\'une commande', async () => {                           // Test pour mettre à jour le statut d'une commande
        await order.addToCart('Pizza', 12.99);                                              // Ajout de la pizza
        order.updateTotal();                                                                // Mise à jour du total
        const orderDetails = await order.placeOrder();                                      // Passation de la commande
        const updatedOrder = await order.updateOrderStatus(orderDetails.orderNumber, 'confirmed'); // Mise à jour du statut à "confirmer"
        expect(updatedOrder.status).toBe('confirmed');                                      // Vérifie que le statut a bien été mis à jour
    });

    
    test('Récupérer toutes les commandes', async () => {                                     // Test pour récupérer toutes les commandes
        await order.addToCart('Pizza', 12.99);                                               // Ajout de la première pizza
        order.updateTotal();                                                                 // Mise à jour du total
        await order.placeOrder();                                                            // Passation de la première commande

        await order.addToCart('Salade', 8.99);                                               // Ajout de la salade
        order.updateTotal();                                                                 // Mise à jour du total
        await order.placeOrder();                                                            // Passation de la deuxième commande

        const allOrders = await order.getAllOrders();                                        // Récupération de toutes les commandes
        expect(allOrders).toHaveLength(2);                                                   // Vérifie qu'il y a bien 2 commandes
        expect(allOrders[0].orderNumber).toBe(2);                                            // Vérifie que la première commande a le bon numéro
        expect(allOrders[1].orderNumber).toBe(1);                                            // Vérifie que la deuxième commande a le bon numéro
    });
});
