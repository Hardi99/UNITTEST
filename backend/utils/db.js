const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant');
        console.log(`MongoDB connecté: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erreur: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { connectDB }; 