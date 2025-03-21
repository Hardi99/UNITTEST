const express = require('express');
const cors = require('cors');
const { connectDB } = require('./utils/db');
const Menu = require('./models/menu');
const Order = require('./models/order');
const PaymentSystem = require('./models/payment_system');
const Tracking = require('./models/tracking');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Instances
const menu = new Menu();
const order = new Order();
const paymentSystem = new PaymentSystem();
const tracking = new Tracking();

// Routes
app.post('/api/menu', async (req, res) => {
    try {
        const menuItem = {
            name: req.body.item,
            price: req.body.price,
            description: ''
        };
        const result = await menu.addItem(menuItem);
        const formattedMenu = await menu.getMenu();
        res.status(201).json({ 
            menu: formattedMenu.map(item => ({
                _id: item._id,
                item: item.name,
                price: item.price,
                description: item.description,
                customizations: item.customizations
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/menu', async (req, res) => {
    try {
        const menuItems = await menu.getMenu();
        const formattedMenu = menuItems.map(item => ({
            _id: item._id,
            item: item.name,
            price: item.price,
            description: item.description,
            customizations: item.customizations
        }));
        res.json({ menu: formattedMenu });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/order/cart', async (req, res) => {
    try {
        const result = await order.addToCart(req.body.item, req.body.price);
        res.status(201).json({ cart: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/order/place', async (req, res) => {
    try {
        const result = await order.placeOrder();
        // Créer un suivi de commande avec les détails
        const orderDetails = await order.getOrder(result.orderNumber);
        await tracking.createTracking(result.orderNumber, orderDetails.items, orderDetails.total);
        res.status(201).json({ order: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/payment', async (req, res) => {
    try {
        const result = await paymentSystem.processPayment(
            req.body.orderNumber,
            req.body.amount,
            req.body.paymentMethod
        );
        // Mettre à jour le mode de paiement dans le tracking
        if (result.success) {
            await tracking.updatePaymentMethod(req.body.orderNumber, req.body.paymentMethod);
        }
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/payment/:id', async (req, res) => {
    try {
        const result = await paymentSystem.getPaymentStatus(req.params.id);
        if (!result.success) {
            return res.status(200).json(result);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tracking/:orderNumber', async (req, res) => {
    try {
        const result = await tracking.getOrderStatus(req.params.orderNumber);
        if (!result.success) {
            return res.status(200).json(result);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour réinitialiser la base de données
app.post('/api/reset-db', async (req, res) => {
    try {
        // Supprimer toutes les collections
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.deleteMany({});
        }
        res.json({ message: 'Base de données réinitialisée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Une erreur est survenue sur le serveur'
    });
});

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    } catch (error) {
        console.error('Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app; 