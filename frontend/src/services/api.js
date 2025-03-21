import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menu
export const getMenu = () => api.get('/menu');
export const addMenuItem = (item, price) => api.post('/menu', { item, price });

// Orders
export const addToCart = (item, price) => api.post('/order/cart', { item, price });
export const placeOrder = () => api.post('/order/place');

// Payments
export const processPayment = (orderNumber, amount, paymentMethod) =>
  api.post('/payment', { orderNumber, amount, paymentMethod });
export const getPaymentStatus = (orderNumber) => api.get(`/payment/${orderNumber}`);

// Tracking
export const getOrderStatus = (orderNumber) => api.get(`/tracking/${orderNumber}`);

export default api; 