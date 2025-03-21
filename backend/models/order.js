const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: { type: Number, required: true, unique: true },
    items: [{
        item: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 }
    }],
    total: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

const OrderModel = mongoose.model('Order', orderSchema);

class Order {
    constructor() {
        this.model = OrderModel;
        this.cart = [];
        this.total = 0;
    }

    async addToCart(item, price) {
        this.cart.push({ item, price, quantity: 1 });
        this.updateTotal();
        return this.cart;
    }

    updateTotal() {
        this.total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    async applyPromotion(discount) {
        this.total -= this.total * (discount / 100);
    }

    async placeOrder() {
        const lastOrder = await this.model.findOne().sort({ orderNumber: -1 });
        const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

        const orderDetails = {
            orderNumber: nextOrderNumber,
            items: this.cart,
            total: this.total.toFixed(2),
            status: 'pending'
        };

        const newOrder = new this.model(orderDetails);
        await newOrder.save();

        this.cart = [];
        this.total = 0;

        return orderDetails;
    }

    async getOrder(orderNumber) {
        return await this.model.findOne({ orderNumber });
    }

    async updateOrderStatus(orderNumber, status) {
        return await this.model.findOneAndUpdate(
            { orderNumber },
            { status },
            { new: true }
        );
    }

    async getAllOrders() {
        return await this.model.find().sort({ createdAt: -1 });
    }
}

module.exports = Order;