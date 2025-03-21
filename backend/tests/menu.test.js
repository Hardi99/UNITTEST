const Menu = require('../models/menu');
const { connect, closeDatabase, clearDatabase } = require('../utils/testUtils');

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await closeDatabase();
});

describe('Gestion du Menu', () => {
    let menu;

    beforeEach(async () => {
        await clearDatabase();
        menu = new Menu();
    });

    test('Ajout d\'un article au menu', async () => {
        const item = {
            name: 'Pizza',
            price: 12.99,
            description: 'Pizza Margherita'
        };
        await menu.addItem(item);
        const menuItems = await menu.getMenu();
        expect(menuItems).toHaveLength(1);
        expect(menuItems[0].name).toBe('Pizza');
    });

    test('Modification d\'un article du menu', async () => {
        const item = {
            name: 'Salade',
            price: 8.99,
            description: 'Salade César'
        };
        const newItem = await menu.addItem(item);
        const updatedItem = {
            name: 'Burger',
            price: 10.99,
            description: 'Burger Gourmet'
        };
        const result = await menu.modifyItem(newItem._id, updatedItem);
        expect(result.name).toBe('Burger');
        expect(result.price).toBe(10.99);
    });

    test('Suppression d\'un article du menu', async () => {
        const item = {
            name: 'Pâtes',
            price: 11.99,
            description: 'Spaghetti Carbonara'
        };
        const newItem = await menu.addItem(item);
        await menu.removeItem(newItem._id);
        const menuItems = await menu.getMenu();
        expect(menuItems).toHaveLength(0);
    });

    test('Ajout d\'un supplément', async () => {
        const item = {
            name: 'Pizza',
            price: 12.99,
            description: 'Pizza Margherita'
        };
        const newItem = await menu.addItem(item);
        const customization = {
            name: 'Fromage',
            options: ['Mozzarella', 'Parmesan'],
            price: 2.99
        };
        const result = await menu.addCustomization(newItem._id, customization);
        expect(result.customizations).toHaveLength(1);
        expect(result.customizations[0].name).toBe('Fromage');
    });

    test('Suppression d\'un supplément', async () => {
        const item = {
            name: 'Pizza',
            price: 12.99,
            description: 'Pizza Margherita',
            customizations: [{
                name: 'Fromage',
                options: ['Mozzarella', 'Parmesan'],
                price: 2.99
            }]
        };
        const newItem = await menu.addItem(item);
        const customizationId = newItem.customizations[0]._id;
        const result = await menu.removeCustomization(newItem._id, customizationId);
        expect(result.customizations).toHaveLength(0);
    });
});