const Menu = require('../models/menu');                                           // Import du Menu et des utilitaires de test
const { connect, closeDatabase, clearDatabase } = require('../utils/testUtils');

beforeAll(async () => {                                                           // Avant tous les tests, on se connecte à la base de données   
    await connect();                                                              // Connexion à la base de données
});

afterAll(async () => {                                                            // Après tous les tests, on ferme la connexion à la base de données
    await closeDatabase();                                                        // Fermeture de la base de données
});

describe('Gestion du Menu', () => {                                               // Suite de tests pour la gestion du Menu
    let menu;                                                                     // Déclaration de la variable menu

    beforeEach(async () => {                                                      // Avant chaque test, on nettoie la base de données et on réinitialise l'objet menu
        await clearDatabase();                                                    // Nettoyage de la base de données
        menu = new Menu();                                                        // Création d'un nouvel objet menu
    });

    test('Ajout d\'un article au menu', async () => {                             // Test pour l'ajout d'un article au menu
        const item = {                                                            // Ajout des données de l'article
            name: 'Pizza',
            price: 12.99,
            description: 'Pizza Margherita'
        };
        await menu.addItem(item);                                                 // Ajout de l'article au menu
        const menuItems = await menu.getMenu();                                   // Récupération de tous les articles du menu
        expect(menuItems).toHaveLength(1);                                        // Vérifie qu'il y a bien un article dans le menu
        expect(menuItems[0].name).toBe('Pizza');                                  // Vérifie que le nom de l'article est correct
    });

    test('Modification d\'un article du menu', async () => {                      // Test pour la modification d'un article du menu
        const item = {                                                            // Définition de l'article à ajouter
            name: 'Salade',
            price: 8.99,
            description: 'Salade César'
        };
        const newItem = await menu.addItem(item);                                  // Ajout de l'article
        const updatedItem = {                                                      // Définition des nouvelles données pour la modification
            name: 'Burger',
            price: 10.99,
            description: 'Burger Gourmet'
        };
        const result = await menu.modifyItem(newItem._id, updatedItem);             // Modification de l'article
        expect(result.name).toBe('Burger');                                         // Vérifie que le nom de l'article modifié est correct
        expect(result.price).toBe(10.99);                                           // Vérifie que le prix modifié est correct
    });

    test('Suppression d\'un article du menu', async () => {                         // Test pour la suppression d'un article du menu
        const item = {                                                              // Définition de l'article à ajouter
            name: 'Pâtes',
            price: 11.99,
            description: 'Spaghetti Carbonara'
        };
        const newItem = await menu.addItem(item);                                    // Ajout de l'article
        await menu.removeItem(newItem._id);                                          // Suppression de l'article par son ID
        const menuItems = await menu.getMenu();                                      // Récupération des articles du menu
        expect(menuItems).toHaveLength(0);                                           // Vérifie que le menu est vide après suppression
    });

    test('Ajout d\'un supplément', async () => {                                     // Test pour l'ajout d'un supplément à un article
        const item = {                                                               // Définition de l'article à ajouter
            name: 'Pizza',
            price: 12.99,
            description: 'Pizza Margherita'
        };
        const newItem = await menu.addItem(item);                                     // Ajout de l'article
        const customization = {                                                       // Définition du supplément à ajouter
            name: 'Fromage',
            options: ['Mozzarella', 'Parmesan'],
            price: 2.99
        };
        const result = await menu.addCustomization(newItem._id, customization);       // Ajout du supplément à l'article
        expect(result.customizations).toHaveLength(1);                                // Vérifie que l'article a bien un supplément
        expect(result.customizations[0].name).toBe('Fromage');                        // Vérifie que le nom du supplément est correct
    });

    test('Suppression d\'un supplément', async () => {                                // Test pour la suppression d'un supplément d'un article
        const item = {                                                                // Définition de l'article avec un supplément
            name: 'Pizza',
            price: 12.99,
            description: 'Pizza Margherita',
            customizations: [{
                name: 'Fromage',
                options: ['Mozzarella', 'Parmesan'],
                price: 2.99
            }]
        };
        const newItem = await menu.addItem(item);                                      // Ajout de l'article avec supplément
        const customizationId = newItem.customizations[0]._id;                         // Récupération de l'ID du supplément
        const result = await menu.removeCustomization(newItem._id, customizationId);   // Suppression du supplément
        expect(result.customizations).toHaveLength(0);                                 // Vérifie que le supplément a été supprimé
    });
});
