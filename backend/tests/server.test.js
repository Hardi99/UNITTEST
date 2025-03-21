const request = require('supertest');
const app = require('../server');
const { connect, closeDatabase, clearDatabase } = require('../utils/testUtils');

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await closeDatabase();
});

beforeEach(async () => {
    await clearDatabase();
});

describe('API de gestion des commandes', () => {
    test('Ajout d\'un article au menu', async () => {
        const response = await request(app)
            .post('/api/menu')
            .send({ item: 'Pizza', price: 12.99 });

        expect(response.status).toBe(201);
        expect(response.body.menu[0].item).toBe('Pizza');
        expect(response.body.menu[0].price).toBe(12.99);
    });

    test('Récupérer le menu', async () => {
        await request(app)
            .post('/api/menu')
            .send({ item: 'Burger', price: 10.99 });

        const response = await request(app).get('/api/menu');

        expect(response.status).toBe(200);
        expect(response.body.menu.length).toBeGreaterThan(0);
    });

    test('Ajout d\'un article au panier', async () => {
        const response = await request(app)
            .post('/api/order/cart')
            .send({ item: 'Burger', price: 10 });

        expect(response.status).toBe(201);
        expect(response.body.cart).toContainEqual({ item: 'Burger', price: 10, quantity: 1 });
    });

    test('Passage d\'une commande', async () => {
        await request(app)
            .post('/api/order/cart')
            .send({ item: 'Pizza', price: 12.99 });

        const response = await request(app).post('/api/order/place');

        expect(response.status).toBe(201);
        expect(response.body.order.orderNumber).toBeDefined();
    });

    test('Effectuer un paiement', async () => {
        await request(app).post('/api/order/cart').send({ item: 'Pâtes', price: 15 });
        const orderResponse = await request(app).post('/api/order/place');
        const orderNumber = orderResponse.body.order.orderNumber;

        const response = await request(app)
            .post('/api/payment')
            .send({
                orderNumber,
                amount: 15,
                paymentMethod: 'card'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
    });

    test('Récupérer le statut d\'une commande', async () => {
        await request(app).post('/api/order/cart').send({ item: 'Sushi', price: 20 });
        const orderResponse = await request(app).post('/api/order/place');
        const orderNumber = orderResponse.body.order.orderNumber;

        const response = await request(app).get(`/api/tracking/${orderNumber}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Récupérer un paiement inexistant', async () => {
        const response = await request(app).get('/api/payment/99');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(false);
    });
});