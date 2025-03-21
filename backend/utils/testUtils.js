const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connect = async () => {
    if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    }
};

const closeDatabase = async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
        }
        if (mongoServer) {
            try {
                await mongoServer.stop();
            } catch (error) {
                console.warn('Erreur lors de l\'arrêt du serveur MongoDB:', error);
            }
        }
    } catch (error) {
        console.warn('Erreur lors de la fermeture de la base de données:', error);
    }
};

const clearDatabase = async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }
    }
};

module.exports = {
    connect,
    closeDatabase,
    clearDatabase
};