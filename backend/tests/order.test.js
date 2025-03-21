const Order = require('../models/order');
const { connect, closeDatabase, clearDatabase } = require('../utils/testUtils');

beforeAll(async () => {
    await connect();
}, 10000);

afterAll(async () => {
    await closeDatabase();
}, 10000);

describe('Gestion des Commandes', () => {
    let order;

    beforeEach(async () => {
        await clearDatabase();
        order = new Order();
    }, 10000);

    test('Ajout d\'un article au panier', async () => {
        const result = await order.addToCart('Pizza', 12.99);
        expect(result).toHaveLength(1);
        expect(result[0].item).toBe('Pizza');
        expect(result[0].price).toBe(12.99);
        expect(result[0].quantity).toBe(1);
    });

    test('Calcul du total du panier', async () => {
        await order.addToCart('Pizza', 12.99);
        await order.addToCart('Salade', 8.99);
        order.updateTotal();
        expect(order.total).toBeCloseTo(21.98, 2);
    });

    test('Application d\'une promotion', async () => {
        await order.addToCart('Pizza', 12.99);
        await order.addToCart('Salade', 8.99);
        order.updateTotal();
        await order.applyPromotion(10); // 10% de réduction
        expect(order.total).toBeCloseTo(19.78, 2); // 21.98 - 10%
    });

    test('Passer une commande', async () => {
        await order.addToCart('Pizza', 12.99);
        order.updateTotal();
        const result = await order.placeOrder();
        expect(result.orderNumber).toBe(1);
        expect(result.items).toHaveLength(1);
        expect(result.total).toBe('12.99');
        expect(result.status).toBe('pending');
    });

    test('Récupérer une commande', async () => {
        await order.addToCart('Pizza', 12.99);
        order.updateTotal();
        const orderDetails = await order.placeOrder();
        const retrievedOrder = await order.getOrder(orderDetails.orderNumber);
        expect(retrievedOrder.orderNumber).toBe(orderDetails.orderNumber);
        expect(retrievedOrder.items).toHaveLength(1);
    });

    test('Mettre à jour le statut d\'une commande', async () => {
        await order.addToCart('Pizza', 12.99);
        order.updateTotal();
        const orderDetails = await order.placeOrder();
        const updatedOrder = await order.updateOrderStatus(orderDetails.orderNumber, 'confirmed');
        expect(updatedOrder.status).toBe('confirmed');
    });

    test('Récupérer toutes les commandes', async () => {
        await order.addToCart('Pizza', 12.99);
        order.updateTotal();
        await order.placeOrder();
        
        await order.addToCart('Salade', 8.99);
        order.updateTotal();
        await order.placeOrder();

        const allOrders = await order.getAllOrders();
        expect(allOrders).toHaveLength(2);
        expect(allOrders[0].orderNumber).toBe(2);
        expect(allOrders[1].orderNumber).toBe(1);
    });
});